import React from 'react';
import AsyncSelect from 'react-select/async';
import { faBookmark as faBookmarked } from "@fortawesome/free-solid-svg-icons";
import { faBookmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Switch from "react-switch";
import Container from 'react-bootstrap/Container';
import _ from 'lodash';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import { Route, withRouter } from 'react-router-dom';


import './App.css';
import Home from './components/Home';
import Section from './components/Section';
import Detailed from './components/Detailed';
import Results from './components/Results';
import Favorites from './components/Favorites';

const promiseOptions = inputValue =>
    new Promise(resolve => {
        setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://api.cognitive.microsoft.com/bing/v7.0/suggestions?q=${inputValue}`,
                    {
                        headers: {
                            "Ocp-Apim-Subscription-Key": "413a61a329e243fc837653de3b99e151"
                        }
                    }
                );
                const data = await response.json();
                const resultsRaw = data.suggestionGroups[0].searchSuggestions;
                const results = resultsRaw.map(result => ({ label: result.displayText.toLowerCase(), value: result.displayText, url: result.url }));
                resolve(results)
            } catch (error) {
                console.error(`Error fetching search ${inputValue}`);
            }
        }, 1000);
    });

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            values: '',
            inputValue: '',
            isSwitchable: true,
            checked: localStorage.getItem('checked') === 'true' ? true : false,
        };
        this.handleResultSelect = this.handleResultSelect.bind(this);
        this.bookmark = this.bookmark.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSwitchOn = this.handleSwitchOn.bind(this);
        this.handleSwitchOff = this.handleSwitchOff.bind(this);
    }

    handleResultSelect = (selected) => {
        if (selected.label !== '') {
            let obj ={value: selected.value, label: selected.label};
            this.setState({values: obj});
            this.props.history.push({
                pathname: '/search',
                search: '?q=' + selected.label,
            })
        } else {
            this.setState({ values: selected.label });
        }
    }

    bookmark = (item) => () => {
        this.setState({ isBookmarked: true });
        this.props.history.push('/favorites');
    }

    handleChange(checked) {
        localStorage.setItem('checked', checked);
        this.setState({ checked });
    }

    handleSwitchOff = (pathName) => {
        if (this.state.isSwitchable) {
            this.setState((prevState) => ({
                isSwitchable: !prevState.isSwitchable
            }));
        }
    }

    handleSwitchOn = (pathName) => {
        if (!this.state.isSwitchable) {
            this.setState((prevState) => ({
                isSwitchable: !prevState.isSwitchable
            }));
        }
    }


    render() {
        return (
            <div>
                <Navbar className="color-navbar" expand="lg" variant="dark">
                    <div style={{ width: '17em' }}>
                        <AsyncSelect
                            defaultOptions={[{ label: "No match" }]}
                            loadOptions={_.debounce(promiseOptions, 1000, {
                                leading: true
                              })}
                            placeholder={'Enter keyword...'}
                            value={this.props.location.pathname==='/search' ? this.state.values : ''}
                            onChange={this.handleResultSelect}
                        />
                    </div>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto" activeKey={this.props.location.pathname}>
                            <Nav.Link href="/#">Home</Nav.Link>
                            <Nav.Link href="#World">World</Nav.Link>
                            <Nav.Link href="#Politics">Politics</Nav.Link>
                            <Nav.Link href="#Business">Business</Nav.Link>
                            <Nav.Link href="#Technology">Technology</Nav.Link>
                            <Nav.Link href="#Sports">Sports</Nav.Link>
                        </Nav>
                        <div className="rightmost-navbar">
                            <OverlayTrigger
                                placement='bottom'
                                flip={true}
                                overlay={
                                    <Tooltip>
                                        Bookmark
                                </Tooltip>
                                }>
                                {this.props.location.pathname==='/favorites' ?
                                    <FontAwesomeIcon onClick={this.bookmark(this.state.apiResponse)} size='1x' style={{ marginRight: 10, cursor: 'pointer', color: 'white', height: 1 + 'em' }} icon={faBookmarked} /> :
                                    <FontAwesomeIcon onClick={this.bookmark(this.state.apiResponse)} size='1x' style={{ marginRight: 10, cursor: 'pointer', color: 'white', height: 1 + 'em' }} icon={faBookmark} />
                                }
                            </OverlayTrigger>
                            <div className={this.state.isSwitchable ? 'switch-visible' : 'switch-hidden'}>
                                <label style={{ marginBottom: 0 }}>
                                    <span style={{ color: 'white', fontSize: '1.1em' }}>NYTimes</span>
                                    <Switch
                                        checked={this.state.checked}
                                        onChange={this.handleChange}
                                        onColor="#86d3ff"
                                        onHandleColor="#2693e6"
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                        height={20}
                                        width={48}
                                        className="react-switch"
                                    // id="material-switch"
                                    />
                                    <span style={{ color: 'white', fontSize: '1.1em' }}>Guardian</span>
                                </label>
                            </div>
                        </div>
                    </Navbar.Collapse>
                </Navbar>
                <div>
                    <Route exact path="/"
                        component={(routeProps) => <Container fluid><Home checked={this.state.checked} handleSwitchOn={this.handleSwitchOn} {...routeProps} /></Container>}
                    />
                    <Route exact path="/World"
                        component={(routeProps) => <Container fluid><Section checked={this.state.checked} handleSwitchOn={this.handleSwitchOn} {...routeProps} /></Container>}
                    />
                    <Route exact path="/Politics"
                        component={(routeProps) => <Container fluid><Section checked={this.state.checked} handleSwitchOn={this.handleSwitchOn} {...routeProps} /></Container>}
                    />
                    <Route exact path="/Business"
                        component={(routeProps) => <Container fluid><Section checked={this.state.checked} handleSwitchOn={this.handleSwitchOn} {...routeProps} /></Container>}
                    />
                    <Route exact path="/Technology"
                        component={(routeProps) => <Container fluid><Section checked={this.state.checked} handleSwitchOn={this.handleSwitchOn} {...routeProps} /></Container>}
                    />
                    <Route exact path="/Sports"
                        component={(routeProps) => <Container fluid><Section checked={this.state.checked} handleSwitchOn={this.handleSwitchOn} {...routeProps} /></Container>}
                    />
                    <Route exact path="/article"
                        component={(routeProps) => <Container fluid><Detailed checked={this.state.checked} handleSwitchOff={this.handleSwitchOff} {...routeProps} /></Container>}
                    />
                    <Route exact path="/search"
                        component={(routeProps) => <Container fluid><Results checked={this.state.checked} handleSwitchOff={this.handleSwitchOff} handleResetValue={this.handleResultSelect} {...routeProps} /></Container>}
                    />
                    <Route exact path="/favorites"
                        component={(routeProps) => <Container fluid><Favorites checked={this.state.checked} handleSwitchOff={this.handleSwitchOff} {...routeProps} /></Container>}
                    />
                </div>
            </div>
        );
    }
}

export default withRouter(App);
