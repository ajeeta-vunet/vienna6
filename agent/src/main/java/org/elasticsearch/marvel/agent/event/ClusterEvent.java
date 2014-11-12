/**
 * ELASTICSEARCH CONFIDENTIAL
 * _____________________________
 *
 *  [2014] Elasticsearch Incorporated All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Elasticsearch Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Elasticsearch Incorporated
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Elasticsearch Incorporated.
 */


package org.elasticsearch.marvel.agent.event;

import org.elasticsearch.action.admin.cluster.health.ClusterHealthResponse;
import org.elasticsearch.action.admin.cluster.health.ClusterHealthStatus;
import org.elasticsearch.cluster.ClusterState;
import org.elasticsearch.common.collect.ImmutableMap;
import org.elasticsearch.common.xcontent.ToXContent;
import org.elasticsearch.common.xcontent.XContentBuilder;

import java.io.IOException;

public abstract class ClusterEvent extends Event {

    protected final String event_source;

    public ClusterEvent(long timestamp, String clusterName, String eventSource) {
        super(timestamp, clusterName);
        this.event_source = eventSource;
    }

    @Override
    public String type() {
        return "cluster_event";
    }

    protected abstract String event();

    @Override
    public XContentBuilder addXContentBody(XContentBuilder builder, ToXContent.Params params) throws IOException {
        super.addXContentBody(builder, params);
        builder.field("event", event());
        builder.field("event_source", event_source);
        return builder;
    }

    public static class ClusterBlock extends ClusterEvent {
        private final org.elasticsearch.cluster.block.ClusterBlock block;
        private boolean added;

        public ClusterBlock(long timestamp, String clusterName, org.elasticsearch.cluster.block.ClusterBlock block, boolean added, String eventSource) {
            super(timestamp, clusterName, eventSource);
            this.block = block;
            this.added = added;
        }

        @Override
        protected String event() {
            return (added ? "block_added" : "block_removed");
        }

        @Override
        public String conciseDescription() {
            return (added ? "added" : "removed") + ": [" + block.toString() + "]";
        }

        @Override
        public XContentBuilder addXContentBody(XContentBuilder builder, ToXContent.Params params) throws IOException {
            super.addXContentBody(builder, params);
            builder.startObject("block");
            block.toXContent(builder, ToXContent.EMPTY_PARAMS);
            builder.endObject();
            return builder;
        }
    }

    public static class ClusterStatus extends ClusterEvent {

        ClusterHealthResponse clusterHealth;

        public ClusterStatus(long timestamp, String clusterName, String event_source, ClusterHealthResponse clusterHealth) {
            super(timestamp, clusterName, event_source);
            this.clusterHealth = clusterHealth;
        }

        @Override
        protected String event() {
            return "cluster_status";
        }

        @Override
        public String conciseDescription() {
            return "cluster status is " + clusterHealth.getStatus().name();
        }

        @Override
        public XContentBuilder addXContentBody(XContentBuilder builder, ToXContent.Params params) throws IOException {
            // disable parent outputting of cluster name, it's part of the cluster health.
            ToXContent.Params p = new ToXContent.DelegatingMapParams(ImmutableMap.of("output_cluster_name", "false"), params);
            super.addXContentBody(builder, p);
            return clusterHealth.toXContent(builder, params);
        }
    }

    public static class ClusterStateChange extends ClusterEvent {
        static ToXContent.MapParams xContentParams = new ToXContent.MapParams(
                ImmutableMap.of("filter_metadata", "true",  //0.90.X options
                        "metric", "version,master_node,nodes,blocks,routing_table")); // 1.0 options

        ClusterState state;
        private String description;
        private ClusterHealthStatus clusterStatus;

        public ClusterStateChange(long timestamp, ClusterState state, String description, ClusterHealthStatus clusterStatus,
                                  String clusterName, String event_source) {
            super(timestamp, clusterName, event_source);
            this.state = state;
            this.description = description;
            this.clusterStatus = clusterStatus;
        }

        @Override
        public String type() {
            return "cluster_state";
        }

        @Override
        protected String event() {
            return "cluster_state";
        }

        @Override
        public String conciseDescription() {
            return description;
        }

        @Override
        public XContentBuilder addXContentBody(XContentBuilder builder, ToXContent.Params params) throws IOException {
            super.addXContentBody(builder, params);
            builder.field("status", clusterStatus.name().toLowerCase());
            state.toXContent(builder, xContentParams);
            return builder;
        }
    }
}
