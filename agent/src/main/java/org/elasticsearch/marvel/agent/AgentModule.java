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

package org.elasticsearch.marvel.agent;

import org.elasticsearch.common.inject.AbstractModule;
import org.elasticsearch.common.inject.Scopes;
import org.elasticsearch.common.inject.multibindings.Multibinder;
import org.elasticsearch.marvel.agent.exporter.ESExporter;
import org.elasticsearch.marvel.agent.exporter.Exporter;

public class AgentModule extends AbstractModule {

    @Override
    protected void configure() {
        Multibinder<Exporter> multibinder = Multibinder.newSetBinder(binder(), Exporter.class);
        multibinder.addBinding().to(ESExporter.class).in(Scopes.SINGLETON);
        bind(AgentService.class).in(Scopes.SINGLETON);
    }
}
