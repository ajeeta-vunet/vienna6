package org.elasticsearch.marvel.monitor.event;
/*
 * Licensed to ElasticSearch under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. ElasticSearch licenses this
 * file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


import org.elasticsearch.cluster.node.DiscoveryNode;
import org.elasticsearch.cluster.routing.ShardRouting;
import org.elasticsearch.common.xcontent.ToXContent;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.marvel.monitor.Utils;

import java.io.IOException;

public abstract class RoutingEvent extends Event {

    public RoutingEvent(long timestamp) {
        super(timestamp);
    }

    @Override
    public String type() {
        return "routing_event";
    }

    public abstract String event();

    @Override
    public XContentBuilder addXContentBody(XContentBuilder builder, ToXContent.Params params) throws IOException {
        super.addXContentBody(builder, params);
        builder.field("event", event());
        return builder;
    }


    static abstract class RoutingShardEvent extends RoutingEvent {

        protected final ShardRouting shardRouting;
        protected final DiscoveryNode node;

        public RoutingShardEvent(long timestamp, ShardRouting shardRouting, DiscoveryNode node) {
            super(timestamp);
            this.node = node;
            this.shardRouting = shardRouting;
        }

        @Override
        public XContentBuilder addXContentBody(XContentBuilder builder, ToXContent.Params params) throws IOException {
            super.addXContentBody(builder, params);
            builder.field("index", shardRouting.index());
            builder.field("shard_id", shardRouting.id());
            builder.startObject("node");
            Utils.NodeToXContent(node, builder);
            builder.endObject();
            builder.field("routing"); // shard routing opens it's own object.
            shardRouting.toXContent(builder, params);
            return builder;
        }
    }

    public static class ShardInitializing extends RoutingShardEvent {

        public ShardInitializing(long timestamp, ShardRouting shardRouting, DiscoveryNode node) {
            super(timestamp, shardRouting, node);
        }

        @Override
        public String event() {
            return "shard_initializing";
        }

        @Override
        String conciseDescription() {
            return shardRouting.shardId() + "[" + (shardRouting.primary() ? "P" : "R") + "] set to initializing on " + node;
        }
    }

    public static class ShardRelocating extends RoutingShardEvent {

        final DiscoveryNode relocatingTo;

        public ShardRelocating(long timestamp, ShardRouting shardRouting, DiscoveryNode node, DiscoveryNode relocatingTo) {
            super(timestamp, shardRouting, node);
            this.relocatingTo = relocatingTo;
        }

        @Override
        public String event() {
            return "shard_relocating";
        }

        @Override
        String conciseDescription() {
            return shardRouting.shardId() + "[" + (shardRouting.primary() ? "P" : "R") + "] set to relocate to "
                    + relocatingTo + " from " + node;
        }

        @Override
        public XContentBuilder addXContentBody(XContentBuilder builder, ToXContent.Params params) throws IOException {
            super.addXContentBody(builder, params);
            builder.startObject("relocated_to");
            Utils.NodeToXContent(relocatingTo, builder);
            builder.endObject();
            return builder;
        }
    }

}
