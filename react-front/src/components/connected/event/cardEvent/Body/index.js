import React, { Component } from 'react';
import './styles.css';
import SearchBar from '../../../searchbar';
import LocationSearchInput from '../../locationSearchInput'
import MemberList  from './MemberList';
import {Divider, Icon, Col, Row, Modal, Input, DatePicker } from 'antd';
import PersonalPlayer from '../../personalPlayer'
import axios from 'axios'
import { updateEvent, updateTracks } from '../../../sockets';


class Body extends Component {
        constructor(props) {
            super(props);

        this.state = {
            playlistId : this.props.state.data.event.playlist && this.props.state.data.event.playlist.id ? this.props.state.data.event.playlist.id : null
        }
        this.roomID =  this.props.state.data.event._id

    }

    componentDidMount = () => {
        this.setState({formatDate: this.formatDateAnnounce(this.props.state.data.event.event_date)})
    }
    updateLocation = (val) => {
        let location = {
                "address" : {
                    "p": val.addressObj.address_components[5]  ? val.addressObj.address_components[5].long_name : "Inconnue",
                    "v": val.addressObj.address_components[2]  ? val.addressObj.address_components[2].long_name : "Inconnue",
                    "cp": val.addressObj.address_components[6] ? val.addressObj.address_components[6].long_name : "Inconnue",
                    "r": val.addressObj.address_components[1]  ? val.addressObj.address_components[1].long_name : "Inconnue",
                    "n": val.addressObj.address_components[0]  ? val.addressObj.address_components[0].long_name : "Inconnue"
                },
                "coord": {
                    "lat": val.location.coord ? val.location.coord.lat: 0,
                    "lng": val.location.coord ? val.location.coord.lng: 0,
                }
        }
        this.props.state.data.event.location = location
        this.props.updateParent({'data':this.props.state.data})
    }

    handleChangeDateModal = (value, dateString) => {
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let ret     = "Le : " + new Date(dateString).toLocaleDateString('fr-Fr', options) + ' à ' + dateString.split(" ")[1];
        
        this.props.state.data.event.event_date = new Date(dateString)
        this.props.updateParent({'data':this.props.state.data})
        this.setState({formatDate:ret})
    }

    handleChangeModal = (e) => {
        this.props.state.data.event[e.target.name] = e.target.value;
        this.props.updateParent({'data': this.props.state.data})
    }
    updateEventMember = (value, type) => {
        if (value && type === 'member')
            this.props.state.data.event.members.push(value)
        else if  (value && type === 'admin')
            this.props.state.data.event.adminMembers.push(value)
        this.props.updateParent({'data': this.props.state.data})
        updateEvent(this.roomID, this.props.state.data.event)
    }
    updateEventPlaylist = playlist => {
        if (playlist)
        {
            axios.get(process.env.REACT_APP_API_URL + '/playlist/' + playlist.id, {'headers':{'Authorization': 'Bearer '+ localStorage.getItem('token')}})
            .then((resp) => { 
                playlist = resp.data
                this.props.state.data.event.playlist = playlist;
                this.props.updateParent({'data' : this.props.state.data, 'playlistId':playlist.id})
                console.log("Playlist change, socket update Event")
                updateEvent(this.roomID, this.props.state.data.event)
                updateTracks(this.roomID, this.props.state.data.event.playlist.tracks.data)
                this.setState({playlistId:playlist.id})         
            })
            .catch((err) => { console.log("Wrong Playlist id.", err); })  
        }
    }
    removeMember = (type, item) => {
        let tab = [];
        if (type === 'admin') tab = this.props.state.data.event.adminMembers
        else  tab = this.props.state.data.event.members

        for (let i = 0; i < tab.length; i++)
        {
            if (tab[i]._id === item._id) {
                tab.splice(i, 1)
                break;
            }
        }
        if (type === 'admin') this.props.state.data.event.adminMembers = tab
        else  this.props.state.data.event.members = tab
        this.props.updateParent({'data': this.props.state.data});
        updateEvent(this.roomID, this.props.state.data.event)

    }
    showModal = value => {
        if (this.props.right.isCreator || this.props.right.isAdmin)
            this.setState({[value]: true});
    }
    handleOk = value => {
        console.log("GOING TO UPDATE EVENT")
        updateEvent(this.roomID, this.props.state.data.event)
        this.setState({[value]: false});
    }
    handleCancel = value => {
        this.setState({[value]: false});
    }
    formatDateAnnounce = date => {
        date                    = date.toString()
        let hours               = '';
        let timeEvent           = new Date(date).getTime();
        let curTime             = new Date(new Date()).getTime()
        let timeBeforeEvent     = timeEvent - curTime;
        let dayTimeStamp        = (3600 * 1000) * 24;
        let weekTimeStamp       = dayTimeStamp * 7;
        let options             = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let ret                 = "Le : " + new Date(date).toLocaleDateString('fr-Fr', options);

        if (date.includes("Z")) {
            hours = date.split("Z")[0];
            if (hours) {
                hours = hours.split("T")[1];
                hours = hours.split(".")[0];
            }
        }
        else
            hours = date.split(' ')[4]

        if (timeBeforeEvent < 0.0)
            return "Déja passée"
        if (timeBeforeEvent > weekTimeStamp)
            return ret
        else if (timeBeforeEvent === weekTimeStamp)
            return ("Dans une semaine")
        else {
           let day = timeBeforeEvent / dayTimeStamp
            if (day < 1)
                return "Aujourd'hui à " + hours
            if (day <= 2)
                return "Demain à " + hours
            if (day > 2) 
                return "Après-demain à " + hours
            else 
                return ("Dans " + day + ' jours')
        }
    }

	render() {
        return (
            <div>
                <Row>
                    <Col span={4}/>
                    <Col span={14}>
                        <h1 className="titleBig"  onClick={this.showModal.bind(this, "modTitle")}> {this.props.state.data.event.title || "Aucun"}</h1>
                        <i className="titleBig fas fa-map" style={{color:'#00695c'}}onClick={this.props.updateMap.bind(this)}></i>
                        <Divider />
                    </Col>
                </Row>
                <Row style={{height:'80px'}}>
                    <Col span={5}/>
                    <Col span={5} style={{ borderLeft: '2px solid #03a9f4'}}>
                        <div style={{margin:'0 0 0 3%'}} onClick={this.showModal.bind(this, "modLocation")}>
                            <Icon className="titleMedium" type="pushpin" theme="outlined" />
                            <b className="titleMedium"> {this.props.state.data.event.location.address.v} </b>
                        </div>
                    </Col>
                    <Col span={5}>
                        <div onClick={this.showModal.bind(this, "modDate")}>
                            <Icon className="titleMedium"  type="clock-circle" theme="outlined" />
                            <b className="titleMedium"> { this.formatDateAnnounce(this.props.state.data.event.event_date)}</b>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={5}/>
                    <Col span={2}><b> Description : </b></Col>
                    <Col span={8}>
                        <div onClick={this.showModal.bind(this, "modDesc")}>
                            <p> { this.props.state.data.event.description } </p>
                        </div>
                        <Divider />
                    </Col>
                </Row>

                <MemberList state={this.props.state} name={" Ajouter un membre :"}  members={this.props.state.data.event.members} type={"member"}       removeMember={this.removeMember} updateEventMember={this.updateEventMember} right={this.props.right}/>
                <MemberList state={this.props.state} name={" Ajouter un admin :"}   members={this.props.state.data.event.adminMembers} type={"admin"}   removeMember={this.removeMember} updateEventMember={this.updateEventMember} right={this.props.right}/>
                
                <Divider />
                {
                    this.props.right.isAdmin || this.props.right.isCreator ? 
                    <Row style={{height:'70px'}}>
                        <Col span={5}/>
                        <Col span={3} >
                            <p  > Ajouter une playlist : </p>
                        </Col>
                        <Col span={3}>
                            <SearchBar state={this.props.state} type="playlist" updateEventPlaylist={this.updateEventPlaylist}/>
                        </Col>
                    </Row>
                    :
                    null
                }
                { this.state.playlistId  && this.props.state.data.event.playlist.tracks.data.length > 0 ? <PersonalPlayer  tracks={this.props.state.data.event.playlist.tracks.data}/> : null} 
                {/* Modal for description modification  */}
                <Modal title="Description : " visible={this.state.modDesc} onOk={this.handleOk.bind(this, "modDesc")} onCancel={this.handleCancel.bind(this, "modDesc")} >
                    <Input.TextArea  placeholder="Descriptif de l'évènement : " name= "description" value={this.props.state.data.event.description} onChange={this.handleChangeModal}/> 
                </Modal>
                {/* Modal for title modification  */}
                <Modal title="Title : " visible={this.state.modTitle} onOk={this.handleOk.bind(this, "modTitle")} onCancel={this.handleCancel.bind(this, "modTitle")} >
                    <Input  placeholder="Descriptif de l'évènement : " name= "title" value={this.props.state.data.event.title} onChange={this.handleChangeModal}/> 
                </Modal>
                {/* Modal for date modification  */}
                <Modal title="Date : " visible={this.state.modDate} onOk={this.handleOk.bind(this, "modDate")} onCancel={this.handleCancel.bind(this, "modDate")} >
                        <Row>
                            <Col span={8}/>
                            <Col span={8}> <div style={{textAlign:'center'}}> <b> {this.state.formatDate} </b></div>  </Col>
                        </Row>
                        <Divider />
                        <Row>
                            <Col span={8}/>
                            <Col span={8}>
                                <DatePicker
                                    name="event_date"
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="Select Time"
                                    onChange={this.handleChangeDateModal}
                                />
                            </Col>
                        </Row>
                </Modal>
                {/* Modal for location modification  */}
                <Modal title="Localisation : " visible={this.state.modLocation} onOk={this.handleOk.bind(this, "modLocation")} onCancel={this.handleCancel.bind(this, "modLocation")} >
                    <LocationSearchInput state={this.props.state} updateLocation={this.updateLocation} />
                </Modal>
            </div>
        );
  }
}

export default Body;
