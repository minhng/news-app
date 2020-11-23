import React from 'react';
import Moment from 'moment';
import { withRouter } from 'react-router-dom';
import { faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Badge from 'react-bootstrap/Badge';
import Image from 'react-bootstrap/Image';
import Modal from 'react-bootstrap/Modal';
import {
    EmailShareButton,
    FacebookShareButton,
    TwitterShareButton,
    EmailIcon,
    FacebookIcon,
    TwitterIcon
} from "react-share";

import '../App.css';

class Section extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            apiResponse: [],
            show: false,
            obj: {},
            isLoading: true
        };
        // This binding is necessary to make `this` work in the callback
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.callApi = this.callApi.bind(this);
    }

    async callApi() {
        var pathName = this.props.location.pathname.substr(1, );
        if (pathName === 'Sports' && this.props.checked) {
            pathName = 'Sport'
        }
        if (this.props.checked) {
            try {
                const results = await Promise.all([
                    await fetch('https://newsapp-backend-2020.wl.r.appspot.com/guardianSection/' + pathName.toLowerCase()).then((response) => {
                        return response.json();
                    })
                ]);
                return results
            } catch (error) {
                this.setState({
                    error
                });
            }
        } else {
            try {
                const results = await Promise.all([
                    await fetch('https://newsapp-backend-2020.wl.r.appspot.com/nySection/' + pathName.toLowerCase()).then((response) => {
                        return response.json();
                    })
                ]);
                return results
            } catch (error) {
                this.setState({
                    error
                });
            }
        }
    }

    async componentDidMount() {
        this.props.handleSwitchOn(this.props.location.pathname);
        this.setState({
            isLoading: true
        })
        const results = await this.callApi();
        try {
            if (this.props.checked) {
                this.setState({
                    apiResponse: [...this.state.apiResponse, ...results[0].response.results],
                    isLoading: false
                })
            } else {
                this.setState({
                    apiResponse: [...this.state.apiResponse, ...results[0].results],
                    isLoading: false
                })
            }
        } catch (error) {
            this.setState({
                error
            });
        }
    }

    componentWillUnmount() {
        this.callApi();
    }

    handleClose() {
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
        let id = item.id ? item.id : encodeURIComponent(item.url);
        localStorage.setItem('detailed_source', source);
        this.props.history.push({
            pathname: '/article',
            search: '?id=' + id,
        })
    }


    render() {
        if (this.state.isLoading) return <div className='loading-detailed'><Spinner className='spinner-detailed' animation='grow' variant='primary' /><div>Loading</div></div>;
        if (this.props.checked) {
            return (
                <CardDeck className='horizontal-carddeck' >
                    {
                        this.state.apiResponse.map((item, i) => {
                            const url = item.blocks.main?.elements[0]?.assets[item.blocks.main.elements[0].assets.length - 1] ? item.blocks.main.elements[0].assets[item.blocks.main.elements[0].assets.length - 1].file : 'https://assets.guim.co.uk/images/eada8aa27c12fe2d5afa3a89d3fbae0d/fallback-logo.png';
                            if (item.sectionId.toLowerCase() === 'sport') {
                                item.sectionId = 'sports';
                            }
                            return <Card key={i} onClick={this.handleClick(item)} className='horizontal-card'>
                                <Card.Body className="mid-card">
                                    <Image className="img-body" variant="top" src={url} thumbnail />
                                </Card.Body>
                                <Card.Body>
                                    <Container>
                                        <Card.Title className='title-card'>{item.webTitle} <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faShareAlt} size='xs' onClick={this.handleShow(item)} /></Card.Title>
                                        <Card.Text as='div' className='body-card'>
                                            {item.blocks.body[0].bodyTextSummary}
                                        </Card.Text>
                                    </Container>
                                    <Container className='bottom-card'>
                                        <Card.Text style={{ fontStyle: 'italic' }}>
                                            {Moment(item.webPublicationDate).format('YYYY-MM-DD')}
                                        </Card.Text>
                                        <Badge bsPrefix={item.sectionId}>{item.sectionId}</Badge>
                                    </Container>
                                </Card.Body>
                            </Card>
                        })
                    }
                    < Modal show={this.state.show} onHide={this.handleClose} >
                        <Modal.Header closeButton>
                            <Modal.Title bsPrefix='header-modal'>{this.state.obj.webTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h4 className='share-title-modal'>Share via</h4>
                            <div className='share-icon-modal'>
                                <FacebookShareButton url={this.state.obj.webUrl} hashtag='#CS_571_NewsApp'>
                                    <FacebookIcon size={64} round />
                                </FacebookShareButton>
                                <TwitterShareButton url={this.state.obj.webUrl} hashtags={['CSCI_571_NewsApp']}>
                                    <TwitterIcon size={64} round />
                                </TwitterShareButton>
                                <EmailShareButton url={this.state.obj.webUrl} subject='#CS_571_NewsApp'>
                                    <EmailIcon size={64} round />
                                </EmailShareButton>
                            </div>
                        </Modal.Body>
                    </Modal>
                </CardDeck >
            );
        } else {
            return (<CardDeck className='horizontal-carddeck' >
                {
                    this.state.apiResponse.map((item, i) => {
                        let url = item?.multimedia ? item?.multimedia[0]?.url : 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Nytimes_hq.jpg';
                        let section;
                        if (item.section.toLowerCase() !== 'business' && item.section.toLowerCase() !== 'technology' && item.section.toLowerCase() !== 'health' && item.section.toLowerCase() !== 'sports' && item.section.toLowerCase() !== 'politics' && item.section.toLowerCase() !== 'world') {
                            section = 'default-badge'; 
                        }
                        return <Card key={i} onClick={this.handleClick(item)} className='horizontal-card'>
                            <Card.Body className="mid-card">
                                <Image className="img-body" variant="top" src={url} thumbnail />
                            </Card.Body>
                            <Card.Body>
                                <Container>
                                    <Card.Title className='title-card'>{item.title} <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faShareAlt} size='xs' onClick={this.handleShow(item)} /></Card.Title>
                                    <Card.Text as='div' className='body-card'>
                                        {item.abstract}
                                    </Card.Text>
                                </Container>
                                <Container className='bottom-card'>
                                    <Card.Text style={{ fontStyle: 'italic' }}>
                                        {Moment(item.published_date).format('YYYY-MM-DD')}
                                    </Card.Text>
                                    <Badge bsPrefix={section ? section : item.section.toLowerCase()}>{item.section}</Badge>
                                </Container>
                            </Card.Body>
                        </Card>
                    })                    
                }
                <Modal show={this.state.show} onHide={this.handleClose} >
                    <Modal.Header closeButton>
                        <Modal.Title bsPrefix='header-modal'>{this.state.obj.source === 'The New York Times' ? this.state.obj.headline.main : this.state.obj.webTitle}</Modal.Title>
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
            </CardDeck >);
        }
    }
}

export default withRouter(Section);
