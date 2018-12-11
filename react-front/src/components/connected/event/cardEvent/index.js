import React, { Component } from 'react';
import { message, Divider, Row, Col} from 'antd';
import CardHeader from './Header'
import CreatorProfil from './creatorProfil'
import BodyEvent from './Body'
import Map from '../map'
import geolib from 'geolib'
import {socket, createRoom, closeRoom, leaveRoom, updateEvent, updateTracks} from '../../../other/sockets';

export default class cardEvent extends Component {
	constructor(props) {
        super(props);
        this.state = {
            isHidden    : false,
            isCreator   : false,
            isAdmin     : false,
            isMember    : false,
            isViewer    : true,
        };
    }
    isUser = tab => {
        tab.forEach(user => { 
            if (user.email === this.props.state.user.email)
                return true
        });
        return false;
    }
    checkRight = () => {
        if (this.props.state.data.event.creator.email === this.props.state.user.email)
            this.setState({isCreator:true});
        else {
            this.setState({
                isMember:this.isUser(this.props.state.data.event.members),
                isAdmin :this.isUser(this.props.state.data.event.adminMembers)
            });
        }
        if (this.state.isCreator || this.state.isMember || this.state.isAdmin)
            this.setState({isViewer:false});
    }
    componentDidMount = () => {
        socket.on('updateEvent', (newEvent) => {
            console.log('socket :  updateEvent receive data ', newEvent)
            this.props.state.data.event = newEvent
            this.props.updateParent({'data': this.props.state.data})
            this.checkRight()
        })
        socket.on('createRoom', (tracks, msg) => {
            console.log('socket : createRoom receive data ', msg)
        });
        socket.on('updateTracks', (tracks, msg) => {
            console.log('socket : updateTracks receive data ', msg)
        });
        socket.on('joinRoom', (msg) => {
            console.log('socket : joinRoom receive message ->', msg)
        });
        socket.on('closeRoom', (msg) => {
           this.props.updateParent({currentComponent:'cardEvent'})
        });
        socket.on('leaveRoom', (msg) => {
            console.log('socket : leaveRoom receive message ->', msg)
        });
        let tracks = this.props.state.data.event.playlist && this.props.state.data.event.playlist.tracks ? this.props.state.data.event.playlist.tracks.data : [];
        createRoom(this.props.state.data.event._id, tracks, this.props.state.data.event, this.props.state.user._id);
        this.checkRight();
        window.scrollTo(1000, 1000)
    }
    updateMap = () => {
        let calc = geolib.getDistanceSimple(
            { latitude: this.props.state.data.userCoord.lat,             longitude: this.props.state.data.userCoord.lng },
            { latitude: this.props.state.data.event.location.coord.lat,  longitude: this.props.state.data.event.location.coord.lng }
        );
        message.info("Vous êtes a " + calc/1000 + " km de l'event");
        this.setState({'isHidden': !this.state.isHidden});
    }
    isToday = date => {
        let timeEvent           = new Date(date).getTime();
        let curTime             = new Date(new Date()).getTime()
        let timeBeforeEvent     = timeEvent - curTime;
        let dayTimeStamp        = (3600 * 1000) * 24;
        let day                 = timeBeforeEvent / dayTimeStamp

        if (timeBeforeEvent <= dayTimeStamp/24 && day < 1 && day > -1)
            return true;
        else
            return false;
    }
   openLiveEvent = () => {
        const is_start = this.props.state.data.event.is_start
        const is_finish = this.props.state.data.event.is_finish
        const tracks = this.props.state.data.event.playlist && this.props.state.data.event.playlist.tracks ? this.props.state.data.event.playlist.tracks.data : [];

        console.log("COUCOU")
        if (((!is_start) || (is_start && is_finish)) && this.state.isCreator)
        {
            console.log("Enter and update Tracks")
            if (!is_start)
            {
                updateTracks(this.props.state.data.event._id, tracks)
                this.props.state.data.event.is_start    = true;
                this.props.state.data.event.is_finish   = false;
                updateEvent(this.props.state.data.event._id, this.props.state.data.event)
            }
            this.props.state.data.right             = this.state;
            // updateEvent(this.props.state.data.event._id, this.props.state.data.event)
        }
        this.props.state.data.right             = this.state;
        console.log("GO TO LIVE EVENT")
        this.props.updateParent({currentComponent:'liveEvent'})
    }
    finishEvent = () => {
        this.props.state.data.event.is_finish = true;
        updateEvent(this.props.state.data.event._id, this.props.state.data.event)
        closeRoom(this.props.state.data.event._id)
        this.props.updateParent({data:this.props.state.data})
        let tracks = this.props.state.data.event.playlist && this.props.state.data.event.playlist.tracks ? this.props.state.data.event.playlist.tracks.data : [];
        createRoom(this.props.state.data.event._id, tracks, this.props.state.data.event, this.props.state.user._id);
    }
    quitpage = () => {
        this.props.changeView('listEvent')
        leaveRoom(this.props.state.data.event._id, this.props.state.user._id)
    }
	render() {
        let openLive = '';
        const is_start = this.props.state.data.event.is_start
        const is_finish = this.props.state.data.event.is_finish
        if (this.props.state.data.event.playlist && this.props.state.data.event.playlist.tracks && this.props.state.data.event.playlist.tracks.data.length > 0 ) {
            if (!is_start && this.state.isCreator) {
                openLive =  <Col span={3} offset={1}>
                                <a href="#!" className="btn waves-effect waves-teal" onClick={this.openLiveEvent}>Start live</a> 
                            </Col>
            }
            else if (is_start && is_finish && this.state.isCreator) {
                openLive =  <Col span={3} offset={1}>
                                <a href="#!" className="btn waves-effect waves-teal" onClick={this.openLiveEvent}>Restart live</a> 
                            </Col>
            }
            else if (is_start && !is_finish) {
               openLive =  <Col span={3} offset={1}>
                                <a href="#!" className="btn waves-effect waves-teal" onClick={this.openLiveEvent}>Open live</a> 
                            </Col>
            }
        }
        return  (
            <div>
                <Row>
                    <Col span={3} offset={1}>
                            <a href="#!" className="btn waves-effect waves-teal" onClick={this.quitpage}>Back</a> 
                    </Col>
                    { openLive }
                    { 
                        this.state.isCreator  && (this.props.state.data.event.is_start && !this.props.state.data.event.is_finish)? 
                        <Col span={3} offset={1}>
                                <a href="#!" className="btn waves-effect waves-teal" onClick={this.finishEvent}>Finish live</a> 
                        </Col>
                        :
                        null
                    }
                </Row>
                <CardHeader state={this.props.state} updateParent={this.props.updateParent} />
                <Row>
                    <Col>
                        {
                            this.state.isHidden ? 
                                <div style={{height:'500px'}}>
                                    <Map state={this.props.state} events={[this.props.state.data.event]}/>
                                </div> 
                                : 
                                null
                        }
                    </Col>
                </Row>
                <Divider />
                <CreatorProfil right={this.state} state={this.props.state} updateParent={this.props.updateParent} />
                <BodyEvent right={this.state} state={this.props.state} updateParent={this.props.updateParent} updateMap={this.updateMap.bind(this)}/>
           </div>
        )
  }
}
