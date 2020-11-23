import React from 'react';
import Moment from 'moment';
import { faShareAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import _ from 'lodash';
import {
    EmailShareButton,
    FacebookShareButton,
    TwitterShareButton,
    EmailIcon,
    FacebookIcon,
    TwitterIcon
} from "react-share";
import '../App.css';

class Favorites extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            apiResults: [],
            isLoading: true,
            isFullDescription: false,
            isBookmarked: false,
            show: false,
            obj: {}
        };
        // This binding is necessary to make `this` work in the callback
        this.callApi = this.callApi.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.removeBookmark = this.removeBookmark.bind(this);
    }


    callApi() {
        try {
            const results = localStorage.getItem('items');
            return results;
        } catch (error) {
            this.setState({
                error
            });
        }
    }

    async componentDidMount() {
        const results = await this.callApi();
        this.props.handleSwitchOff(this.props.location.pathname);
        this.setState({
            apiResults: [...this.state.apiResults, ...JSON.parse(results)],
            isLoading: false
        });
    }

    handleShow = (item) => (e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        this.setState({
            show: true,
            obj: item
        });
    }

    handleClick = (item) => (e) => {
        let source = item.id ? 'guardian' : 'nytimes'
        let id = item.id ? item.id : encodeURIComponent(item.web_url);
        localStorage.setItem('detailed_source', source);
        this.props.history.push({
            pathname: '/article',
            search: '?id='+id,
        })
    }

    handleClose() {
        this.setState(state => ({
            show: false
        }));
    }

    removeBookmark = (item) => (e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        // Put the object into storage
        let currentItems = JSON.parse(localStorage.getItem('items')) || [];
        if (item.source !== 'The New York Times') {
            let newItems = _.reject(currentItems, (el) => { return el.id === item.id; });
            localStorage.setItem('items', JSON.stringify(newItems));
            this.setState({
                apiResults: JSON.parse(localStorage.getItem('items'))
            })
        } else {
            let newItems = _.reject(currentItems, (el) => { return el._id === item._id; });
            localStorage.setItem('items', JSON.stringify(newItems));
            this.setState({
                apiResults: JSON.parse(localStorage.getItem('items'))
            })
        }
        toast(`Removing ${item.source!=='The New York Times' ? item.webTitle : item.headline.main}`, { containerId: 'A' });

    }

    render() {
        if (this.state.apiResults.length) {
            return (
                <div>
                    <h3>Favorites</h3>
                    <Row xs={12} md={4}>
                        {this.state.apiResults.map((item, i) => {
                            if (item.source !== 'The New York Times') {
                                let url = item.blocks?.main?.elements[0]?.assets[item.blocks?.main?.elements[0]?.assets?.length - 1] ? item.blocks.main.elements[0].assets[item.blocks.main.elements[0].assets.length - 1].file : 'https://assets.guim.co.uk/images/eada8aa27c12fe2d5afa3a89d3fbae0d/fallback-logo.png';
                                let section;
                                if (item.sectionId && item.sectionId.toLowerCase() !== 'business' && item.sectionId.toLowerCase() !== 'technology' && item.sectionId.toLowerCase() !== 'health' && item.sectionId.toLowerCase() !== 'sports' && item.sectionId.toLowerCase() !== 'politics' && item.sectionId.toLowerCase() !== 'world') {
                                    section = 'default-badge';
                                }
                                return <Card className='column-card' key={i} onClick={this.handleClick(item)}>
                                    <Card.Body>
                                        <Card.Title className='top-card' style={{ fontStyle: 'italic' }}>{item.webTitle} 
                                            <FontAwesomeIcon style={{ cursor: 'pointer', paddingLeft: 5 }} icon={faShareAlt} size='sm' onClick={this.handleShow(item)} />
                                            <FontAwesomeIcon style={{ cursor: 'pointer', paddingLeft: 5 }} icon={faTrash} size='sm' onClick={this.removeBookmark(item)} />
                                        </Card.Title>
                                        <Image variant="top" src={url} thumbnail className='small-thumbnail' />
                                        {/* <div style={{ fontSize: 11 }} className='bottom-card'> */}
                                        <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between', paddingTop: 16, margin: 'auto', width: '95%' }}>
                                            <Card.Text style={{ fontStyle: 'italic' }}>
                                                {Moment(item.webPublicationDate).format('YYYY-MM-DD')}
                                            </Card.Text>
                                            <div>
                                                <Badge style={{ marginRight: 4 }} bsPrefix={section ? section : item.sectionId}>{item.sectionId}</Badge>
                                                <Badge bsPrefix='guardian'>Guardian</Badge>
                                            </div>
                                        </div>
                                    </Card.Body>
                                    <ToastContainer enableMultiContainer containerId={'A'} position={toast.POSITION.TOP_CENTER} style={{ color: 'black !important' }} progressStyle={{ background: '#fff' }} />
                                </Card>
                            } else {
                                let url = (item?.multimedia && item?.multimedia.length>0)  ? 'https://www.nytimes.com/'+item?.multimedia[0]?.url : 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Nytimes_hq.jpg';
                                let section;
                                let section_name = item.news_desk ? item.news_desk.toLowerCase() : item.section_name;
                                if (item.news_desk && item.news_desk.toLowerCase() !== 'business' && item.news_desk.toLowerCase() !== 'technology' && item.news_desk.toLowerCase() !== 'health' && item.news_desk.toLowerCase() !== 'sports' && item.news_desk.toLowerCase() !== 'politics' && item.news_desk.toLowerCase() !== 'world') {
                                    section = 'default-badge';
                                }                                
                                return <Card className='column-card' key={i} onClick={this.handleClick(item)}>
                                    <Card.Body>
                                        <Card.Title className='top-card' style={{ fontStyle: 'italic' }}>{item.headline.main} 
                                            <FontAwesomeIcon style={{ cursor: 'pointer', paddingLeft: 5 }} icon={faShareAlt} size='sm' onClick={this.handleShow(item)} /> 
                                            <FontAwesomeIcon style={{ cursor: 'pointer', paddingLeft: 5 }} icon={faTrash} size='sm' onClick={this.removeBookmark(item)} />
                                        </Card.Title>
                                        {/* <Card.Title style={{ fontStyle: 'italic' }}>{item.headline.main} <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faShareAlt} size='xs' onClick={this.handleShow(item)} /></Card.Title> */}
                                        <Image variant="top" src={url} thumbnail className='small-thumbnail' />
                                        {/* <div style={{ fontSize: 11 }} className='bottom-card'> */}
                                        <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between', paddingTop: 16, margin: 'auto', width: '95%' }}>
                                            <Card.Text style={{ fontStyle: 'italic' }}>
                                                {Moment(item.pub_date).format('YYYY-MM-DD')}
                                            </Card.Text>
                                            <div>
                                                <Badge style={{ marginRight: 4 }} bsPrefix={section ? section : item.news_desk.toLowerCase()}>{section_name}</Badge>
                                                <Badge bsPrefix='nytimes'>NYTimes</Badge>
                                            </div>
                                        </div>
                                    </Card.Body>
                                    <ToastContainer enableMultiContainer containerId={'A'} position={toast.POSITION.TOP_CENTER} style={{ color: 'black !important' }} progressStyle={{ background: '#fff' }} />
                                </Card>                                
                            }
                        })}
                    </Row>
                    < Modal show={this.state.show} onHide={this.handleClose} >
                        <Modal.Header closeButton>
                            <div>
                                <Modal.Title bsPrefix='header-modal'>{this.state.obj.source === 'The New York Times' ? 'NY TIMES' : 'GUARDIAN'}</Modal.Title>
                                <Modal.Title bsPrefix='header-modal' as='h5'>{this.state.obj.source === 'The New York Times' ? this.state.obj.headline.main : this.state.obj.webTitle}</Modal.Title>
                            </div>
                        </Modal.Header>
                        <Modal.Body>
                            <h4 className='share-title-modal'>Share via</h4>
                            <div className='share-icon-modal'>
                                <FacebookShareButton url={this.state.obj.source === 'The New York Times' ? this.state.obj.web_url :this.state.obj.webUrl} hashtag='#CS_571_NewsApp'>
                                    <FacebookIcon size={64} round />
                                </FacebookShareButton>
                                <TwitterShareButton url={this.state.obj.source === 'The New York Times' ? this.state.obj.web_url :this.state.obj.webUrl} hashtags={['CSCI_571_NewsApp']}>
                                    <TwitterIcon size={64} round />
                                </TwitterShareButton>
                                <EmailShareButton url={this.state.obj.source === 'The New York Times' ? this.state.obj.web_url :this.state.obj.webUrl} subject='#CS_571_NewsApp'>
                                    <EmailIcon size={64} round />
                                </EmailShareButton>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            )
        } else {
            return (<h4 style={{ display: 'flex', justifyContent: 'center' }}>You have no saved articles</h4>)
        }
    }
}

export default withRouter(Favorites);
