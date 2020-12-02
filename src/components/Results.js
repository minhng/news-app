import React from 'react';
import Moment from 'moment';
import {faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';

import {
    EmailShareButton,
    FacebookShareButton,
    TwitterShareButton,
    EmailIcon,
    FacebookIcon,
    TwitterIcon
} from "react-share";
import queryString from 'query-string'

import '../App.css';

class Results extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            apiResults: {},
            isLoading: true,
            isFullDescription: false,
            isBookmarked: false,
            obj: {}
        };
    }

    async callApi() {
        const values = queryString.parse(this.props.location.search)
        if (this.props.checked) {
            try {
                const response = await fetch('https://newsapp-backend-2020.wl.r.appspot.com/guardianSearch?q=' + values.q);
                const res = await response.json();
                this.setState({
                    apiResults: res.response.results,
                    isLoading: false
                })
            } catch (error) {
                this.setState({
                    error
                });
            }
        } else {
            try {
                const response = await fetch('https://newsapp-backend-2020.wl.r.appspot.com/nySearch?q=' + values.q);
                const res = await response.json();
                this.setState({
                    apiResults: res.response.docs,
                    isLoading: false
                })
            } catch (error) {
                this.setState({
                    error
                });
            }
        }
    }

    componentDidMount() {
        this.props.handleSwitchOff(this.props.location.pathname);
        this.callApi();
    }

    handleClose = () => {
        this.setState(state => ({
            show: false
        }));
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
            search: '?id=' + id
        })
    }

    render() {
        if (this.state.isLoading) return <div><h3> Results</h3></div>;
        return (
            <div>
                <h3>Results</h3>
                <Row xs={12} md={4}>
                    {this.state.apiResults.map((item, i) => {
                        if (!item._id) {
                            let url = item.blocks.main ?.elements[0] ?.assets[item.blocks.main.elements[0].assets.length - 1] ? item.blocks.main.elements[0].assets[item.blocks.main.elements[0].assets.length - 1].file : 'https://assets.guim.co.uk/images/eada8aa27c12fe2d5afa3a89d3fbae0d/fallback-logo.png';
                            if (item.sectionId && item.sectionId.toLowerCase() === 'sport') {
                                item.sectionId = 'sports';
                            }
                            let section;
                            if (item.sectionId && item.sectionId.toLowerCase() !== 'business' && item.sectionId.toLowerCase() !== 'technology' && item.sectionId.toLowerCase() !== 'health' && item.sectionId.toLowerCase() !== 'sports' && item.sectionId.toLowerCase() !== 'politics' && item.sectionId.toLowerCase() !== 'world') {
                                section = 'default-badge';
                            }
                            return <Card className='column-card' key={i} onClick={this.handleClick(item)}>
                                <Card.Body>
                                    <Card.Title className='top-card' style={{ fontStyle: 'italic' }}>{item.webTitle} <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faShareAlt} size='xs' onClick={this.handleShow(item)} /></Card.Title>
                                    <Image variant="top" src={url} thumbnail className='small-thumbnail' />
                                    <div className='bottom-card' style={{ fontSize: '12px' }}>
                                        <Card.Text style={{ fontStyle: 'italic' }}>
                                            {Moment(item.webPublicationDate).format('YYYY-MM-DD')}
                                        </Card.Text>
                                        <div>
                                            <Badge bsPrefix={section ? section : item.sectionId}>{item.sectionId}</Badge>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        } else {
                            let url = (item?.multimedia && item?.multimedia.length > 0) ? 'https://www.nytimes.com/' + item?.multimedia[0]?.url : 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Nytimes_hq.jpg';
                            let section;
                            let section_name = item.news_desk ? item.news_desk.toLowerCase() : item.section_name;
                            if (item.news_desk && item.news_desk.toLowerCase() !== 'business' && item.news_desk.toLowerCase() !== 'technology' && item.news_desk.toLowerCase() !== 'health' && item.news_desk.toLowerCase() !== 'sports' && item.news_desk.toLowerCase() !== 'politics' && item.news_desk.toLowerCase() !== 'world') {
                                section = 'default-badge';
                            }
                            return <Card className='column-card' key={i} onClick={this.handleClick(item)}>
                                <Card.Body>
                                    <Card.Title className='top-card' style={{ fontStyle: 'italic' }}>{item.headline.main} <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faShareAlt} size='xs' onClick={this.handleShow(item)} /></Card.Title>
                                    <Image variant="top" src={url} thumbnail className='small-thumbnail' />
                                    <div className='bottom-card' style={{ fontSize: '12px' }}>
                                        <Card.Text style={{ fontStyle: 'italic' }}>
                                            {Moment(item.pub_date).format('YYYY-MM-DD')}
                                        </Card.Text>
                                        <div>
                                            <Badge bsPrefix={section ? section : item.news_desk.toLowerCase()}>{section_name}</Badge>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        }
                    })}
                </Row>
                < Modal show={this.state.show} onHide={this.handleClose} >
                    <Modal.Header closeButton>
                        <Modal.Title bsPrefix='header-modal'>{this.state.obj.source === 'The New York Times' ? this.state.obj.headline.main : this.state.obj.webTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4 className='share-title-modal'>Share via</h4>
                        <div className='share-icon-modal'>
                            <FacebookShareButton url={this.state.obj.source === 'The New York Times' ? this.state.obj.web_url : this.state.obj.webUrl} hashtag='#CS_571_NewsApp'>
                                <FacebookIcon size={64} round />
                            </FacebookShareButton>
                            <TwitterShareButton url={this.state.obj.source === 'The New York Times' ? this.state.obj.web_url : this.state.obj.webUrl} hashtags={['CSCI_571_NewsApp']}>
                                <TwitterIcon size={64} round />
                            </TwitterShareButton>
                            <EmailShareButton url={this.state.obj.source === 'The New York Times' ? this.state.obj.web_url : this.state.obj.webUrl} subject='#CS_571_NewsApp'>
                                <EmailIcon size={64} round />
                            </EmailShareButton>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

export default withRouter(Results);
