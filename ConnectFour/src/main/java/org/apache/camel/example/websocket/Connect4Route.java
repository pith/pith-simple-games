/**
 * Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to You under
 * the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */

package org.apache.camel.example.websocket;

import org.apache.camel.LoggingLevel;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.websocket.WebsocketComponent;

/**
 * A Camel route that updates from twitter all tweets using having the search term. And post the changes to web-socket, that can
 * be viewed from a web page
 */
public class Connect4Route extends RouteBuilder {

  private int port = 9090;

  private String newGameName;

  public Connect4Route(String newGameName) {
    this.newGameName = newGameName;
  }

  public int getPort() {
    return port;
  }

  public void setPort(int port) {
    this.port = port;
  }

  @Override
  public void configure() throws Exception {
    // setup Camel web-socket component on the port we have defined
    WebsocketComponent wc = getContext().getComponent("websocket", WebsocketComponent.class);
    wc.setPort(port);

    from("websocket://0.0.0.0:9090/connect4" + newGameName).log(LoggingLevel.INFO, ">> Message received : ${body}").to(
        "websocket://0.0.0.0:9090/connect4" + newGameName + "?sendToAll=true&staticResources=classpath:webapp");
  }
}
