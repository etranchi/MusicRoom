import React, { Component } from 'react';
import './styles.css'
import "antd/dist/antd.css";
import {Icon, Row, Col} from 'antd';


class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
    }

    this.selectedMenu = {
      'backgroundColor':'#00695c',
      'opacity':1,
      'borderRadius':'5%'
    }
    
}


  render() {
    return (
              <div className="navBar">
                <Row className="Menu">
                  <Col span={4}></Col>
                  <Col span={16}>

                  <Row >
                    <Col span={5}></Col>
                    <Col 
                      className="MenuCard" 
                      style={ this.props.state.currentComponent === 'event' ? this.selectedMenu : null}
                      span={4}
                      onClick={this.props.updateParent.bind(this, {'currentComponent':"event"})}
                    >
                      <div className="CardContent">
                        <Icon className="MenuCardTextSmall" type="calendar" />
                        <span><b className="MenuCardText">Event</b></span>
                      </div>
                    </Col>
                    <Col span={1}></Col>
                    <Col 
                      className="MenuCard" 
                      style={ this.props.state.currentComponent === 'playlist' ? this.selectedMenu : null}
                      span={4}
                      onClick={this.props.updateParent.bind(this, {'currentComponent':"playlist"})}
                    >
                      <div className="CardContent">
                        <Icon className="MenuCardText" type="bars" />
                        <span> <b className="MenuCardText">Playlist</b> </span>
                      </div>
                    </Col>
                    <Col span={1}></Col>
                    <Col 
                      className="MenuCard" 
                      style={ this.props.state.currentComponent === 'setting' ? this.selectedMenu : null}
                      span={4}
                      onClick={this.props.updateParent.bind(this, {'currentComponent':"setting"})}
                    >
                        <div className="CardContent">
                          <Icon className="MenuCardText" type="tool" />
                          <span><b className="MenuCardText">Setting</b></span>
                        </div>
                    </Col>
                    <Col span={5}></Col>
                </Row>
                    
                  </Col>
                  <Col span={4}></Col>
                </Row>
                </div>
      
    );
  }
}

export default App;
