import { updateVisualizationPermissions } from './update_visualization_permissions';

export async function getVisualizationInterlinkedData(
  updatedVisualizations,
  dashboardPermissions,
  savedVisualizations,
  visualizationIds,
  savedSearchIds) {

  //This is to store inter linked saved seaches id's
  const interlinkedSavedSearchIds = [];

  //This is to store inter linked BMV's id's
  const interlinkedBMVIds = [];

  //This is an object having interlinked saved searches list and interlinked bmvs
  const allInterlinkedIdsOfDashboard = {};

  //This is to store interlinkedVisualizationId's without duplicates
  const bmvIdsWithoutDuplicates = [];

  //This is to store interlinkedSavedSearcheId's without duplicates
  const savedSearchesIdsWithoutDuplicates = [];

  updatedVisualizations.map((eachVisualization) => {
    //if saved searchId is undefined that means the visulization is not created directly using saved search
    if (eachVisualization.savedSearchId === undefined) {
      if (eachVisualization.vis.type.name === 'business_metric') {
        //when dashbaord is created using Business metric visulization
        const bmvMetrics = eachVisualization.vis.params.metrics;
        bmvMetrics.map((eachMetric) => {
          if (eachMetric.savedSearch && eachMetric.savedSearch.id !== '') {
            interlinkedSavedSearchIds.push(eachMetric.savedSearch.id);
          }
        });
      } else if(eachVisualization.vis.type.name === 'status_indicator_and_kpi') {
        //when dashbaord is created using KPI visualization
        const kpiParameters = eachVisualization.vis.params.parameters;
        kpiParameters.map((eachParameter) => {
          if (eachParameter.name && !interlinkedBMVIds.includes(eachParameter.name.id)) {
            interlinkedBMVIds.push(eachParameter.name.id);
          }
        });
      } else if(eachVisualization.vis.type.name === 'bullet_vis') {
        //when dashbaord is created using Bullet visualization
        const bullets = eachVisualization.vis.params.bullets;
        bullets.map((eachBullet) => {
          if (eachBullet.name && !interlinkedBMVIds.includes(eachBullet.name.id)) {
            interlinkedBMVIds.push(eachBullet.name.id);
          }
        });
      } else if(eachVisualization.vis.type.name === 'insight_vis') {
        //when dashbaord is created using Insight visulization
        const insightBMVs = eachVisualization.vis.params.bmv;
        insightBMVs.map((eachBMV) => {
          if (eachBMV.name  && !interlinkedBMVIds.includes(eachBMV.name.id)) {
            interlinkedBMVIds.push(eachBMV.name.id);
          }
        });
      } else if(eachVisualization.vis.type.name === 'customer_journey_map') {
        //when dashbaord is created using Customer Journer Map visualization
        const metricGroups = eachVisualization.vis.params.metricGroups;
        const stages = eachVisualization.vis.params.stages;
        stages.map((eachStage) => {
          const stageName = eachStage.name;
          metricGroups.map((eachBMV) => {
            if (eachBMV.metrics && !interlinkedBMVIds.includes(eachBMV.metrics[stageName].id)) {
              const eachStageBMV = eachBMV.metrics[stageName].id;
              interlinkedBMVIds.push(eachStageBMV);
            }
          });
        });
      } else if(eachVisualization.vis.type.name === 'unified_transaction_map') {
        //when dashbaord is created using Unified transaction map visualization
        const graphs = eachVisualization.vis.params.graphs;
        const links = eachVisualization.vis.params.customLinks;
        const nodes = eachVisualization.vis.params.customNodes;

        //Getting BMV's added for graphs,subgraphs and metrics
        graphs.map((eachGraph) => {
          if (!interlinkedBMVIds.includes(eachGraph.bmv.id)) {
            interlinkedBMVIds.push(eachGraph.bmv.id);
          }
          eachGraph.subGraphVisList.map((eachSubgraph) => {
            if (!interlinkedBMVIds.includes(eachSubgraph.id)) {
              interlinkedBMVIds.push(eachSubgraph.id);
            }
          });
          eachGraph.metrics.map((eachMetric) => {
            if (!interlinkedBMVIds.includes(eachMetric.name.id)) {
              interlinkedBMVIds.push(eachMetric.name.id);
            }
          });
        });
        //Getting BMV's added for links
        links.map((eachLink) => {
          eachLink.metrics.map((eachMetric) => {
            if (!interlinkedBMVIds.includes(eachMetric.name.id)) {
              interlinkedBMVIds.push(eachMetric.name.id);
            }
          });
        });
        //Getting BMV's added for nodes
        nodes.map((eachNode) => {
          eachNode.metrics.map((eachMetric) => {
            if (!interlinkedBMVIds.includes(eachMetric.name.id)) {
              interlinkedBMVIds.push(eachMetric.name.id);
            }
          });
        });
      }
    } else {
      //If any visualizations are created using saved searches getting those inter linked id's
      if (!interlinkedSavedSearchIds.includes(eachVisualization.savedSearchId)) {
        interlinkedSavedSearchIds.push(eachVisualization.savedSearchId);
      }
    }
  });

  //Getting interlinked BMV visualizations updated object
  const BMVlinkedSavedSearches = Promise.resolve(
    updateVisualizationPermissions(dashboardPermissions, interlinkedBMVIds, savedVisualizations)
  );
  //Getting BMV's inter linked saved searches
  await BMVlinkedSavedSearches.then(function (result) {
    result.visualizations.map((eachBMVviz) => {
      const bmvMetrics = eachBMVviz.vis.params.metrics;
      bmvMetrics.map((eachMetric) => {
        if (eachMetric.savedSearch && eachMetric.savedSearch.id !== '' && !interlinkedSavedSearchIds.includes(eachMetric.savedSearch.id)) {
          interlinkedSavedSearchIds.push(eachMetric.savedSearch.id);
        }
      });
    });
  });

  //To remove duplicate visualization id's
  //we already checking for duplictes in above code but still we need to check with directly linked visulizations so here we are cheking one more time
  interlinkedBMVIds.map((eachVizId) => {
    if (!visualizationIds.includes(eachVizId) && !bmvIdsWithoutDuplicates.includes(eachVizId)) {
      bmvIdsWithoutDuplicates.push(eachVizId);
    }
  });
  //To remove duplicate savedsearch id's
  //we may have directly linked saved searches which may be also inter linked to any BMV and for multiple BMV's same saved search may be linked so here we are removing duplicates
  interlinkedSavedSearchIds.map((eachSavedSearchId) => {
    if (!savedSearchIds.includes(eachSavedSearchId) && !savedSearchesIdsWithoutDuplicates.includes(eachSavedSearchId)) {
      savedSearchesIdsWithoutDuplicates.push(eachSavedSearchId);
    }
  });

  allInterlinkedIdsOfDashboard.linkedBmvIds = bmvIdsWithoutDuplicates;
  allInterlinkedIdsOfDashboard.linkedSavedSearchIds = savedSearchesIdsWithoutDuplicates;

  return allInterlinkedIdsOfDashboard;
}