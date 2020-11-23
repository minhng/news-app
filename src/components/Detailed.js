import React from 'react';
import Moment from 'moment';
import { faBookmark as faBookmarked, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { faBookmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import commentBox from 'commentbox.io';
import _ from 'lodash';

import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Container from 'react-bootstrap/Container';
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

class Detailed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            apiResponse: {},
            isLoading: true,
            isFullDescription: false,
            isBookmarked: false,
            source: localStorage.getItem('detailed_source') 
        };
        this.fullToggle = this.fullToggle.bind(this);
        this.bookmark = this.bookmark.bind(this);
        this.callApi = this.callApi.bind(this);
        this.myRef = React.createRef();
    }

    async callApi() {
        const values = queryString.parse(this.props.location.search)
        if (this.state.source==='guardian') {
            try {
                const results = await Promise.all([
                    await fetch('https://newsapp-backend-2020.wl.r.appspot.com/article?id=' + values.id + '&source=guardian').then((response) => {
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
                    await fetch('https://newsapp-backend-2020.wl.r.appspot.com/article?id=' + values.id + '&source=nytimes').then((response) => {
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
        this.props.handleSwitchOff(this.props.location.pathname);
        this.setState({
            isLoading: true
        })
        const results = await this.callApi();
        try {
            if (this.state.source==='guardian') {
                this.setState({
                    apiResponse: results[0].response.content,
                    isLoading: false
                })
            } else {
                this.setState({
                    apiResponse: results[0].response.docs[0],
                    isLoading: false
                })
            }
        } catch (error) {
            this.setState({
                error
            });
        }
        this.removeCommentBox = commentBox('5669103704473600-proj');
        await this.bookmarked();
    }

    fullToggle(ref) {
        const currentState = this.state.isFullDescription;
        this.setState({ isFullDescription: !currentState });
        ref.current.scrollIntoView({behavior: 'smooth'})
    }

    bookmark() {
        // Put the object into storage
        let oldItems = JSON.parse(localStorage.getItem('items')) || [];
        oldItems.push(this.state.apiResponse);
        localStorage.setItem('items', JSON.stringify(oldItems));
        this.setState({ isBookmarked: true });
        toast(`Saving ${this.state.apiResponse.webTitle ? this.state.apiResponse.webTitle : this.state.apiResponse.headline.main}`, { containerId: 'A' });

    }

    removeBookmark() {
        // Put the object into storage
        let currentItems = JSON.parse(localStorage.getItem('items')) || [];
        if (this.state.source==='guardian') {
            let newItems = _.reject(currentItems, (el) => { return el.id === this.state.apiResponse.id; });
            localStorage.setItem('items', JSON.stringify(newItems));
        } else {
            let newItems = _.reject(currentItems, (el) => { return el._id === this.state.apiResponse._id; });
            localStorage.setItem('items', JSON.stringify(newItems));
        }
        this.setState({ isBookmarked: false });
        toast(`Removing ${this.state.apiResponse.webTitle ? this.state.apiResponse.webTitle : this.state.apiResponse.headline.main}`, { containerId: 'A' });

    }

    bookmarked() {
        let oldItems = JSON.parse(localStorage.getItem('items')) || [];
        if (this.state.source==='guardian') {
            for (let val of oldItems) {
                if (val?.blocks?.body[0]?.id === this.state.apiResponse.blocks?.body[0]?.id) {
                    this.setState({ isBookmarked: true });
                    return;
                }
            }
        } else {
            for (let val of oldItems) {
                if (val._id === this.state.apiResponse._id) {
                    this.setState({ isBookmarked: true });
                    return;
                }
            }            
        }
    }

    render() {
        if (this.state.isLoading) return <div className='loading-detailed'><Spinner className='spinner-detailed' animation='grow' variant='primary' /><div>Loading</div></div>;
        if (this.state.source==='guardian') {
            let url = this.state.apiResponse.blocks?.main?.elements[0]?.assets[this.state.apiResponse.blocks?.main?.elements[0]?.assets.length - 1] ? this.state.apiResponse.blocks?.main?.elements[0]?.assets[this.state.apiResponse.blocks?.main?.elements[0]?.assets.length - 1]?.file : 'https://assets.guim.co.uk/images/eada8aa27c12fe2d5afa3a89d3fbae0d/fallback-logo.png';
            return (
                <div>
                    <Card className='horizontal-carddeck' style={{  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)'}}>
                        <Card.Body>
                            <Container fluid>
                                <Card.Title as='h4' style={{ fontStyle: 'italic' }}>{this.state.apiResponse.webTitle}</Card.Title>
                                <div className='subtitle-detailed'>
                                    <div className="mb-2 text-muted">{Moment(this.state.apiResponse.webPublicationDate).format('YYYY-MM-DD')}</div>
                                    <div className='icons-detailed'>
                                        <div className='share-detailed'>
                                            <OverlayTrigger
                                                placement='top'
                                                overlay={
                                                    <Tooltip>
                                                        Facebook
                                                </Tooltip>
                                                }>
                                                <FacebookShareButton url={this.state.apiResponse.webUrl} hashtag='#CS_571_NewsApp'>
                                                    <FacebookIcon size={32} round />
                                                </FacebookShareButton>
                                            </OverlayTrigger>
                                            <OverlayTrigger
                                                placement='top'
                                                overlay={
                                                    <Tooltip>
                                                        Twitter
                                                </Tooltip>
                                                }>
                                                <TwitterShareButton url={this.state.apiResponse.webUrl} hashtags={['CSCI_571_NewsApp']}>
                                                    <TwitterIcon size={32} round />
                                                </TwitterShareButton>
                                            </OverlayTrigger>
                                            <OverlayTrigger
                                                placement='top'
                                                overlay={
                                                    <Tooltip>
                                                        Email
                                                </Tooltip>
                                                }>
                                                <EmailShareButton url={this.state.apiResponse.webUrl} subject='#CS_571_NewsApp'>
                                                    <EmailIcon size={32} round />
                                                </EmailShareButton>
                                            </OverlayTrigger>
                                        </div>
                                        <OverlayTrigger
                                            id={this.state.apiResponse.blocks?.body[0]?.id}
                                            placement='top'
                                            overlay={
                                                <Tooltip>
                                                    Bookmark
                                                </Tooltip>
                                            }>
                                            <div className='bookmark-detailed'>
                                                {this.state.isBookmarked ?
                                                    <FontAwesomeIcon onClick={() => this.removeBookmark()} style={{ cursor: 'pointer', color: 'tomato' }} icon={faBookmarked} size='2x' /> :
                                                    <FontAwesomeIcon onClick={() => this.bookmark()} style={{ cursor: 'pointer', color: 'tomato' }} icon={faBookmark} size='2x' />
                                                }
                                            </div>
                                        </OverlayTrigger>
                                    </div>
                                </div>
                                <Card.Img
                                    variant="top" src={url} />
                                <Card.Text ref={this.myRef} as='div' className={this.state.isFullDescription ? 'full-detailed' : 'short-detailed'}>
                                    {this.state.apiResponse.blocks?.body[0]?.bodyTextSummary}
                                </Card.Text>
                                {this.state.isFullDescription ?
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }} onClick={() => this.fullToggle(this.myRef)}><FontAwesomeIcon icon={faAngleUp} /> </div> :
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }} onClick={() => this.fullToggle(this.myRef)}><FontAwesomeIcon icon={faAngleDown} /> </div>
                                }
                            </Container>
                        </Card.Body>
                        <ToastContainer enableMultiContainer containerId={'A'} position={toast.POSITION.TOP_CENTER} style={{ color: 'black !important' }} progressStyle={{ background: '#fff' }} />
                    </Card>
                    <div className="commentbox" id={this.state.apiResponse.blocks?.body[0]?.id} />
                </div>
            );
        } else {
            let url = (this.state.apiResponse?.multimedia && this.state.apiResponse?.multimedia.length>0)  ? 'https://www.nytimes.com/'+this.state.apiResponse?.multimedia[0]?.url : 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Nytimes_hq.jpg';
            return (
                <div>
                    <Card className='horizontal-carddeck' style={{  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)'}}>
                        <Card.Body>
                            <Card.Title as='h4' style={{ fontStyle: 'italic' }}>{this.state.apiResponse.headline.main}</Card.Title>
                            <div className='subtitle-detailed'>
                                <Card.Subtitle className="mb-2 text-muted">{Moment(this.state.apiResponse.pub_date).format('YYYY-MM-DD')}</Card.Subtitle>
                                <div className='icons-detailed'>
                                    <div className='share-detailed'>
                                        <OverlayTrigger
                                            placement='top'
                                            overlay={
                                                <Tooltip>
                                                    Facebook
                                            </Tooltip>
                                            }>
                                            <FacebookShareButton url={this.state.apiResponse.web_url} hashtag='#CS_571_NewsApp'>
                                                <FacebookIcon size={32} round />
                                            </FacebookShareButton>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            placement='top'
                                            overlay={
                                                <Tooltip>
                                                    Twitter
                                            </Tooltip>
                                            }>
                                            <TwitterShareButton url={this.state.apiResponse.web_url} hashtags={['CSCI_571_NewsApp']}>
                                                <TwitterIcon size={32} round />
                                            </TwitterShareButton>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            placement='top'
                                            overlay={
                                                <Tooltip>
                                                    Email
                                            </Tooltip>
                                            }>
                                            <EmailShareButton url={this.state.apiResponse.web_url} subject='#CS_571_NewsApp'>
                                                <EmailIcon size={32} round />
                                            </EmailShareButton>
                                        </OverlayTrigger>
                                    </div>
                                    <OverlayTrigger
                                        id={this.state.apiResponse._id}
                                        placement='top'
                                        overlay={
                                            <Tooltip>
                                                Bookmark
                                            </Tooltip>
                                        }>
                                        <div className='bookmark-detailed'>
                                            {this.state.isBookmarked ?
                                                <FontAwesomeIcon onClick={() => this.removeBookmark()} style={{ cursor: 'pointer', color: 'tomato' }} icon={faBookmarked} size='2x' /> :
                                                <FontAwesomeIcon onClick={() => this.bookmark()} style={{ cursor: 'pointer', color: 'tomato' }} icon={faBookmark} size='2x' />
                                            }
                                        </div>
                                    </OverlayTrigger>
                                </div>
                            </div>
                            <Card.Img
                                variant="top" src={url} />
                            <Card.Text ref={this.myRef} as='div' className={this.state.isFullDescription ? 'full-detailed' : 'short-detailed'}>
                                {this.state.apiResponse.abstract}
                            </Card.Text>
                        </Card.Body>
                        <ToastContainer enableMultiContainer containerId={'A'} position={toast.POSITION.TOP_CENTER} style={{ color: 'black !important' }} progressStyle={{ background: '#fff' }} />
                    </Card>
                    <div className="commentbox" id={this.state.apiResponse._id} />
                </div>
            );
        }
    }
}

export default withRouter(Detailed);
