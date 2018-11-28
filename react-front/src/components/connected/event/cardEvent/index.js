import React, { Component } from 'react';
import './styles.css';
import { message, Button, Divider, Row, Col} from 'antd';
import CardHeader from './Header'
import CreatorProfil from './creatorProfil'
import BodyEvent from './Body'
import Map from '../map'
import axios from 'axios'
import geolib from 'geolib'
import {socket, createRoom, joinRoom, updateTracks, leaveRoom} from '../../sockets';

class cardEvent extends Component {
	constructor(props) {
        super(props);

        this.state = {
            isHidden: false,
            isCreator: false,
            isAdmin: false,
            isMember: false,
            isViewer: true,
        }
        this.launchButton = {
            'position': 'fixed',
            'bottom': '50px',
            'height': '80px',
            'right': '140px',
            'latitude': 0,
            'longitude': 0,
            'displayUser' : false
        
        }
        console.log('card event constructor');
    }


    isUser = tab => 
    {
        for (let i = 0; i < tab.length; i++) {
            if (tab[i].email === this.props.state.user.email)
                return true;
        }
        return false;
    }
    componentDidMount = () => {
        socket.on('updateEvent', (newEvent) => {
            console.log('Receive SOCKET UPDATE')
            this.props.state.data.event = newEvent
            this.setState({'data': this.props.state.data})
        })
        socket.on('createRoom', (tracks, msg) => {
            if (msg === 'err')
            {
                console.log("Room joined")
                joinRoom(this.props.state.data.event._id)
            }
            else
             console.log("Room created : ", tracks, "Message : ", msg)
        })
        socket.on('joinRoom', (msg) => {
            console.log("joinRoom : ", msg)
        })
        socket.on('leaveRoom', (msg) => {
            console.log("Leaving Room ", msg)
        })
        createRoom(this.props.state.data.event._id, [], this.props.state.data.event)
        if (this.props.state.data.event.creator.email === this.props.state.user.email)
            this.setState({isCreator:true})
        else  {
            this.setState({isMember:this.isUser(this.props.state.data.event.members)})
            this.setState({isAdmin:this.isUser(this.props.state.data.event.adminMembers)})
        }

        if (this.state.isCreator || this.state.isMember || this.state.isAdmin)
            this.setState({isViewer:false})
    }
    componentWillUnmount = () => {
        console.log("UNMOUNTING")
        leaveRoom(this.props.state.data.event._id)
    }
    updateMap = () => {
        let calc = geolib.getDistanceSimple(
            {latitude: this.props.state.data.userCoord.lat, longitude: this.props.state.data.userCoord.lng},
            {latitude: this.props.state.data.event.location.coord.lat, longitude:this.props.state.data.event.location.coord.lng}
        );
        this.info("Vous êtes a " + calc/1000 + " km de l'event")
        this.props.state.data.mapHeight = '25vh'
        this.props.state.data.mapMargin = '0 0 0 0'
        this.setState({'isHidden': !this.state.isHidden})
    }
    openLiveEvent = () => {
        updateTracks(this.props.state.data.event._id, this.props.state.data.event.playlist.tracks.data)
        this.props.updateParent({'currentComponent':'liveEvent'})
    }    
    isToday = date => {

        let timeEvent           = new Date(date).getTime();
        let curTime             = new Date(new Date()).getTime()
        let timeBeforeEvent     = timeEvent - curTime;
        let dayTimeStamp        = (3600 * 1000) * 24;
        let day                 = timeBeforeEvent / dayTimeStamp

        console.log("Console.log", timeBeforeEvent, dayTimeStamp)
        if (timeBeforeEvent <= dayTimeStamp/24 && day < 1 && day > -1)
            return true;
        else
            return false;
    }
    info = text => {
        message.info(text);
    }
	render() {
        console.log(this.props);
        return  (
            <div>
                <CardHeader state={this.props.state} updateParent={this.props.updateParent} />
                <Row>
                    <Col>
                        {this.state.isHidden ? <div style={{height:'500px'}}><Map state={this.props.state} events={[this.props.state.data.event]}/></div> : null}
                    </Col>
                </Row>
                <Divider />
                <CreatorProfil right={this.state} state={this.props.state} updateParent={this.props.updateParent} />
                <BodyEvent right={this.state} state={this.props.state} updateParent={this.props.updateParent} updateMap={this.updateMap.bind(this)}/>
                {
                    this.isToday(this.props.state.data.event.event_date) ?
                        <Button   style={this.launchButton} type="primary" onClick={this.openLiveEvent}> <b> Start Event </b> </Button>
                        : 
                        null
                }
           </div>
        )
  }
}

export default cardEvent;
