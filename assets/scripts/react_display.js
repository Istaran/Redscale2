var pusher;

var helper;
var gameDisplayer;
var formData = {};
var saveSlot = 0;
var userid;
var frame = 0;

function setGameState(data) {
    gameDisplayer.setState(
        { 
            frame: frame++, 
            animationDone: false,
            gameState: data
        });
}

function setError() {
    gameDisplayer.setState(
        { 
            frame: frame++, 
            animationDone: true,
            gameState: { 
                display: [
                    { 
                        type: "text", 
                        text: "There was an error trying to do that. Click refresh to restore your controls, or email istaran@redscalesadventure.online if your problem persists.",
                        pause: 0
                    }
                ], 
                controls: [[{ type: "refresher" }]] 
            } 
        });
}

function getStatus() {
    fetch('/act' + location.search, {
        method: 'post',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ 'body': { 'verb': 'status', 'slot': saveSlot } })
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        setGameState(data);
    }).catch(function (err) {
        setError();
    });
}

function getSaveList() {
    fetch('/list', {
        method: 'get'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        gameDisplayer.setState({ saveList: data, gameState: null });
    }).catch(function (err) {
        setError();
    });
}

class HelpDisplayer extends React.Component {
	constructor(props) {
		super(props);
		helper = this;
		this.state = {help: null};
		this.oldHelp = null;
	}
	
	render() {
		if (this.state.help) {
			this.oldHelp = this.state.help;
			return <div className='div-help'>{this.state.help}</div>;
		}
		if (this.oldHelp) {
		return <div className='div-unhelp'>{this.oldHelp}</div>;
		}
		return null;
	}
}

class ChatDisplayer extends React.Component {
	constructor(props) {
		super(props);
	}
		
	handleClickSend = function() {
		var chatText = document.getElementById('chatInput');
		fetch('/chat', {
		method: 'post',
		headers: {
		   "Content-Type": "application/json; charset=utf-8",
		},
		body: JSON.stringify({ 'body': chatText.value })
	  }).then(function(response) {
		return response.text();
	  }).then(function(data) {
		// no-op
	  });
	  chatText.value = "";
	}
	
	handleChatKeyUp = function (event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			this.handleClickSend();
		}	
	};
	
	render() {
		let chatDisplay = this.props.chatLog.map((text, index) => { 
             return (<tr key={index}><td style={this.props.markupLog[index]}>{text}</td></tr>); 
            });
		
		return (
				<div id='chatDiv' className='div-bottom'>
					<div id='chatScroll' className='div-scroll-bottom'>
						<table id='chatlist' className='chatlist'>
							<tbody id='chatlistbody'>{chatDisplay}</tbody>
						</table>
					</div><div id='chatInputSection' className='chatInputSection'>
						<input type='textbox' id='chatInput' className='chatInput' onKeyUp={(event) => this.handleChatKeyUp(event)}></input>
						<input type='button' id='chatSend' className='chatSend' onClick={(event) => this.handleClickSend(event)} value='Send'></input>
					</div>
					<HelpDisplayer />
				</div>);
	}
}

class ActButton extends React.Component {
    constructor(props) {
        super(props);
    };

    takeAction = function () {
        let self = this;
        helper.setState({ help: null });
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': self.props.verb, 'slot': saveSlot, 'id': self.props.id, 'data': formData } })
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    render() {
        var width = 150 + 155 * (this.props.extendRight || 0);
        return <input type='button' className='actButton' style={{ width: width }} onClick={(event) => this.takeAction(event)} value={this.props.display} disabled={!this.props.enabled} onMouseOver={(event) => helper.setState({ help: this.props.help })} onMouseOut={(event) => helper.setState({ help: null })} />;
	}
}


class Card extends React.Component {
    constructor(props) {
        super(props);
    };

    takeAction = function () {
        let self = this;
        helper.setState({ help: null });
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': self.props.verb, 'slot': saveSlot, 'id': self.props.id } })
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    render() {
        let display = this.props.display;
        let stacks = [];
        for (var i = 1; i < this.props.count; i++) {
            stacks.push(<div className={'stack ' + this.props.verb} key={'stack ' + i} />);
        }
        return <div className='cardBox'><div className={'card ' + this.props.verb} onClick={(event) => this.takeAction(event)} disabled={!this.props.enabled} onMouseOver={(event) => helper.setState({ help: this.props.help })} onMouseOut={(event) => helper.setState({ help: null })} >{display}</div>{stacks}</div>;
    }
}


class Navigator extends React.Component {
	constructor(props) {
		super(props);
	};
	
	navigate(event, dir) {
        let id = this.props.id;
        helper.setState({ help: null });
		if (this.props.details[dir]) {
            fetch('/act' + location.search, {
				method: 'post',
				headers: {
				   "Content-Type": "application/json; charset=utf-8",
				},
                body: JSON.stringify({ 'body': { 'verb': 'travel', 'slot': saveSlot, 'id': id, 'sub': dir }})
			  }).then(function(response) {
				return response.json();
			  }).then(function(data) {
                setGameState(data);
              }).catch(function (err) {
                setError();
              });
		}
	}
	
    render() {
        let backgroundColor = "var(--compass-bg-color)";
        let outlineColor = "var(--compass-fg-color)";
        let outlineDisabled = "var(--compass-do-color)";
        let compassLight = "var(--compass-light-color)";
        let compassDark = "var(--compass-dark-color)";
        let compassDisabled =  "var(--compass-ds-color)";
        let upColor = (this.props.details.up) ? this.props.details.up.light || compassLight : compassLight;
        let upColor2 = (this.props.details.up) ? this.props.details.up.dark || compassDark : compassDisabled;
        let upOutline = (this.props.details.up) ? outlineColor : outlineDisabled;
        let northColor = (this.props.details.north) ? this.props.details.north.light || compassLight : compassDisabled;
        let northColor2 = (this.props.details.north) ? this.props.details.north.dark || compassDark : compassDisabled;
        let northOutline = (this.props.details.north) ? outlineColor : outlineDisabled;
        let westColor = (this.props.details.west) ? this.props.details.west.light || compassLight : compassDisabled;
        let westColor2 = (this.props.details.west) ? this.props.details.west.dark || compassDark : compassDisabled;
        let westOutline = (this.props.details.west) ? outlineColor : outlineDisabled;
        let specialColor = (this.props.details.special) ? this.props.details.special.light || compassLight : backgroundColor;
        let specialColor2 = (this.props.details.special) ? this.props.details.special.dark || compassDark : backgroundColor;
        let specialOutline = (this.props.details.special) ? outlineColor : outlineDisabled;
        let eastColor = (this.props.details.east) ? this.props.details.east.light || compassLight : compassDisabled;
        let eastColor2 = (this.props.details.east) ? this.props.details.east.dark || compassDark : compassDisabled;
        let eastOutline = (this.props.details.east) ? outlineColor : outlineDisabled;
        let southColor = (this.props.details.south) ? this.props.details.south.light || compassLight : compassDisabled;
        let southColor2 = (this.props.details.south) ? this.props.details.south.dark || compassDark : compassDisabled;
        let southOutline = (this.props.details.south) ? outlineColor : outlineDisabled;
        let nwColor = (this.props.details.nw) ? this.props.details.nw.light || compassLight : compassDisabled;
        let nwColor2 = (this.props.details.nw) ? this.props.details.nw.dark || compassDark : compassDisabled;
        let nwOutline = (this.props.details.nw) ? outlineColor : outlineDisabled;
        let neColor = (this.props.details.ne) ? this.props.details.ne.light || compassLight : compassDisabled;
        let neColor2 = (this.props.details.ne) ? this.props.details.ne.dark || compassDark : compassDisabled;
        let neOutline = (this.props.details.ne) ? outlineColor : outlineDisabled;
        let swColor = (this.props.details.sw) ? this.props.details.sw.light || compassLight : compassDisabled;
        let swColor2 = (this.props.details.sw) ? this.props.details.sw.dark || compassDark : compassDisabled;
        let swOutline = (this.props.details.sw) ? outlineColor : outlineDisabled;
        let seColor = (this.props.details.se) ? this.props.details.se.light || compassLight : compassDisabled;
        let seColor2 = (this.props.details.se) ? this.props.details.se.dark || compassDark : compassDisabled;
        let seOutline = (this.props.details.se) ? outlineColor : outlineDisabled;
        let downColor = (this.props.details.down) ? this.props.details.down.light || compassLight : compassDisabled;
        let downColor2 = (this.props.details.down) ? this.props.details.down.dark || compassDark : compassDark;
        let downOutline = (this.props.details.down) ? outlineColor : outlineDisabled;
        let hereColor = (this.props.details.here) ? this.props.details.here.light || compassLight : compassDisabled;
        let hereColor2 = (this.props.details.here) ? this.props.details.here.dark || compassDark : compassDisabled;
        let hereOutline = outlineDisabled;


        let dirs = [{ header: 'Up', prop: 'up' },
            { header: 'NW', prop: 'nw' },
            { header: 'N', prop: 'north' },
            { header: 'NE', prop: 'ne' },
            { header: 'W', prop: 'west' },
            { header: 'E', prop: 'east' },
            { header: 'SW', prop: 'sw' },
            { header: 'S', prop: 'south' },
            { header: 'SE', prop: 'se' },
            { header: 'Down', prop: 'down' },
            { header: 'Special', prop: 'special' }];
        let navHelp = "";
        while (dirs.length) {
            var dir = dirs.shift();
            var header = dir.header;
            if (this.props.details[dir.prop]) {
                for (var i = 0; i < dirs.length;) {
                    if (this.props.details[dirs[i].prop]) {
                        if (this.props.details[dir.prop].text == this.props.details[dirs[i].prop].text) {
                            header += ", " + dirs[i].header;
                            dirs.splice(i, 1);
                        } else {
                            i++;
                        }
                    } else {
                        dirs.splice(i, 1);
                    }
                }
                navHelp += `${header}:${this.props.details[dir.prop].text}\n`;
            }
        }

        return <svg className='navigator' width='150' height='145' onMouseOver={(event) => helper.setState({ help: navHelp })} onMouseOut={(event) => helper.setState({ help: null })}>
		    <defs>
			    <linearGradient id="groundGradient" x1="0" x2="0" y1="0" y2="1">
				    <stop offset="50%" stopColor={downColor}/>
				    <stop offset="95%" stopColor={downColor2}/>
			    </linearGradient>
			    <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
				    <stop offset="5%" stopColor={upColor}/>
				    <stop offset="50%" stopColor={upColor2}/>
			    </linearGradient>
                <linearGradient id="hereGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={hereColor} />
                    <stop offset="50%" stopColor={hereColor2} />
                </linearGradient>
                <linearGradient id="specialGradient" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="15%" stopColor={specialColor} />
                    <stop offset="85%" stopColor={specialColor2} />
                </linearGradient>
            </defs>
            <polygon points="43,0 0,43 149,43 106,0" stroke={upOutline} fill="url(#skyGradient)" onClick={(event) => this.navigate(event, 'up')} />
            <polygon points="0,48 0,98 149,98, 149,48" stroke={hereOutline} fill="url(#hereGradient)" />
            <polygon points="0,103 43,146 106,146, 149,103" stroke={downOutline}  fill="url(#groundGradient)" onClick={(event) => this.navigate(event, 'down')} />
            <circle cx='75' cy='73' r='50' fill={backgroundColor} stroke={outlineColor} strokeWidth="3" />
            <line x1="36.3" y1="50.5" x2="32" y2="48" stroke={outlineColor} strokeWidth="1" />
            <line x1="36.3" y1="95.5" x2="32" y2="98" stroke={outlineColor} strokeWidth="1" />
            <line x1="113.7" y1="50.5" x2="118" y2="48" stroke={outlineColor} strokeWidth="1" />
            <line x1="113.7" y1="95.5" x2="118" y2="98" stroke={outlineColor} strokeWidth="1" />
            <line x1="52.5" y1="34.3" x2="50" y2="30" stroke={outlineColor} strokeWidth="1" />
            <line x1="52.5" y1="111.7" x2="50" y2="116" stroke={outlineColor} strokeWidth="1" />
            <line x1="97.5" y1="34.3" x2="100" y2="30" stroke={outlineColor} strokeWidth="1" />
            <line x1="97.5" y1="111.7" x2="100" y2="116" stroke={outlineColor} strokeWidth="1" />
            <line x1="31.5" y1="61.4" x2="27" y2="60" stroke={outlineColor} strokeWidth="1" />
            <line x1="31.5" y1="84.6" x2="27" y2="86" stroke={outlineColor} strokeWidth="1" />
            <line x1="118.5" y1="61.4" x2="123" y2="60" stroke={outlineColor} strokeWidth="1" />
            <line x1="118.5" y1="84.6" x2="123" y2="86" stroke={outlineColor} strokeWidth="1" />
            <line x1="63.4" y1="29.5" x2="62" y2="25" stroke={outlineColor} strokeWidth="1" />
            <line x1="63.4" y1="116.5" x2="62" y2="121" stroke={outlineColor} strokeWidth="1" />
            <line x1="86.6" y1="29.5" x2="88" y2="25" stroke={outlineColor} strokeWidth="1" />
            <line x1="86.6" y1="116.5" x2="88" y2="121" stroke={outlineColor} strokeWidth="1" />
            <polygon points="40,38 65,63 75,53" fill={nwColor} stroke={nwOutline} strokeWidth="1" onClick={(event) => this.navigate(event, 'nw')} />
            <polygon points="40,38 55,73 65,63" fill={nwColor2} stroke={nwOutline} strokeWidth="1" onClick={(event) => this.navigate(event, 'nw')} />
            <polygon points="40,108 55,73 65,83" fill={swColor} stroke={swOutline} strokeWidth="1" onClick={(event) => this.navigate(event, 'sw')} />
            <polygon points="40,108 65,83 75,93" fill={swColor2} stroke={swOutline} strokeWidth="1" onClick={(event) => this.navigate(event, 'sw')} />
            <polygon points="110,38 85,63 75,53" fill={neColor} stroke={neOutline} strokeWidth="1" onClick={(event) => this.navigate(event, 'ne')} />
            <polygon points="110,38 95,73 85,63" fill={neColor2} stroke={neOutline} strokeWidth="1" onClick={(event) => this.navigate(event, 'ne')} />
            <polygon points="110,108 95,73 85,83" fill={seColor} stroke={seOutline} strokeWidth="1" onClick={(event) => this.navigate(event, 'se')} />
            <polygon points="110,108 85,83 75,93" fill={seColor2} stroke={seOutline} strokeWidth="1" onClick={(event) => this.navigate(event, 'se')} />


            <polygon points="75,22 65,63 75,58" stroke={northOutline} strokeWidth="1" fill={northColor} onClick={(event) => this.navigate(event, 'north')} />
            <polygon points="75,22 75,58 85,63" stroke={northOutline} strokeWidth="1" fill={northColor2} onClick={(event) => this.navigate(event, 'north')} />
            <polygon points="25,73 65,63 60,73" stroke={westOutline} strokeWidth="1" fill={westColor} onClick={(event) => this.navigate(event, 'west')} />
            <polygon points="25,73 60,73 65,83" stroke={westOutline} strokeWidth="1" fill={westColor2} onClick={(event) => this.navigate(event, 'west')}  />
            <circle cx='75' cy='73' r='10' fill="url(#specialGradient)" onClick={(event) => this.navigate(event, 'special')} />
            <polygon points="124,73 85,63 89,73" stroke={eastOutline} strokeWidth="1" fill={eastColor} onClick={(event) => this.navigate(event, 'east')} />
            <polygon points="124,73 89,73 85,83" stroke={eastOutline} strokeWidth="1" fill={eastColor2} onClick={(event) => this.navigate(event, 'east')} />
            <polygon points="75,122 65,83 75,87" stroke={southOutline} strokeWidth="1" fill={southColor} onClick={(event) => this.navigate(event, 'south')}  />
            <polygon points="75,122 75,87 85,83" stroke={southOutline} strokeWidth="1" fill={southColor2} onClick={(event) => this.navigate(event, 'south')} />


		</svg>;
	}	
}

class TextInputer extends React.Component {
    constructor(props) {
        super(props);

        formData[this.props.name] = this.props.default;
    }

    purgeCharacters(event) {
        event.target.value = event.target.value.replace(/[^a-zA-Z0-9 ]/, '');

        formData[this.props.name] = event.target.value || this.props.default;
    }

    render() {
        return <input type="text" placeholder={this.props.default} onInput={(event) => this.purgeCharacters(event)} />;
    }
}

class LeftStatus extends React.Component {
	constructor(props) {
		super(props);
		
	}
	
    render() {
        if (!this.props.source || !this.props.source.lines) return <div display='none'></div>;
		var statuslines = this.props.source.lines.map((line, lineIdx) => {
            if (line.isPercent) {
                return <PercentBar  key={lineIdx} leftVal={line.leftVal} rightVal={line.rightVal} leftColor={line.leftColor} rightColor={line.rightColor} totalWidth='200' height='18px' text={line.text}></PercentBar>
            }
			return <div key={lineIdx} className='statusRow' onMouseOver={(event)=>helper.setState({help:line.help})} onMouseOut={(event)=>helper.setState({help:null})}>{line.text}</div>
		});
		return <div className='leftStatus'>{statuslines}</div>;
	}
}

class RightStatus extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        if (!this.props.source || !this.props.source.lines) return <div display='none'></div>;
        var statuslines = this.props.source.lines.map((line, lineIdx) => {
            if (line.isPercent) {
                return <PercentBar  key={lineIdx} leftVal={line.leftVal} rightVal={line.rightVal} leftColor={line.leftColor} rightColor={line.rightColor} totalWidth='200' height='18px' text={line.text}></PercentBar>
            }
            return <div key={lineIdx} className='statusRow' onMouseOver={(event) => helper.setState({ help: line.help })} onMouseOut={(event) => helper.setState({ help: null })}>{line.text}</div>
        });
        return <div className='rightStatus'>{statuslines}</div>;
    }
}



class Refresher extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div className='refresher' onClick={getStatus}>&#x1f503;Refresh&#x1f503;</div>;
    }
}

class Reconnector extends React.Component {
    constructor(props) {
        super(props);
    }

    

    render() {
        return <a href="login/google" className='refresher'>&#x1F4F6;Reconnect&#x1F4F6;</a>;
    }
}

class Loader extends React.Component {
    constructor(props) {
        super(props);
    }

    onClick(event) {
        saveSlot = this.props.slot;
        getStatus();
    }

    render() {
        return <div className='save' onClick={(event) => this.onClick(event)}>{this.props.text}</div>;
    }
}

class Requantifier extends React.Component {
    constructor(props) {
        super(props);

        // track updated numbers as state.
        var leftCounts = Object.assign({}, props.leftCounts);
        var rightCounts = Object.assign({}, props.rightCounts);
        var leftChecks = props.leftChecks ? Object.assign({}, props.leftChecks) : undefined;
        var thing;
        for (thing in props.displays) {
            leftCounts[thing] = leftCounts[thing] || 0;
            rightCounts[thing] = rightCounts[thing] || 0;
        }

        this.state = {
            leftCounts: leftCounts,
            rightCounts: rightCounts,
            leftChecks: leftChecks
        }
    }

    sum(counts) {
        var total = 0;
        for (var label in counts) {
            if (!isNaN(counts[label]))
                total += counts[label];
        }
        return total;
    }

    checkrules() {
        if (!this.props.rules) return true;

        for (var rule in this.props.rules) {
            let val = this.props.rules[rule];
            switch (rule) {
                case "left minimum count":
                    if (this.sum(this.state.leftCounts) < val)
                        return false;
                    break;
                case "right minimum count":
                    if (this.sum(this.state.rightCounts) < val)
                        return false;
                    break;
                case "left check count":
                    if (this.sum(this.state.leftChecks) != val)
                    return false;
                    break;
            }
        }

        return true; 
    }

    change(thing, deltaRight) {
        if (deltaRight > this.state.leftCounts[thing])
            deltaRight = this.state.leftCounts[thing];
        if (deltaRight < -this.state.rightCounts[thing])
            deltaRight = -this.state.rightCounts[thing];
        var newState = {
            leftCounts: Object.assign({}, this.state.leftCounts),
            rightCounts: Object.assign({}, this.state.rightCounts),
            leftChecks: this.state.leftChecks ? Object.assign({}, this.state.leftChecks) : undefined
        };
        newState.leftCounts[thing] = this.state.leftCounts[thing] - deltaRight;
        newState.rightCounts[thing] = this.state.rightCounts[thing] + deltaRight;
        if(newState.leftChecks && newState.leftChecks[thing] && !newState.leftCounts[thing]) {
            newState.leftChecks[thing] = undefined;
        }

        this.setState(newState);
    }

    setCheck(thing) {
        if (this.state.leftCounts[thing]) {
            var newState = {
                leftCounts: Object.assign({}, this.state.leftCounts),
                rightCounts: Object.assign({}, this.state.rightCounts),
                leftChecks: Object.assign({}, this.state.leftChecks)
            };
            newState.leftChecks[thing] = (newState.leftChecks[thing] || !newState.leftCounts[thing] ?undefined : 1);
            this.setState(newState);
        }
    }

    done() {
        let self = this;
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': 'requantify', 'slot': saveSlot, 'id': self.props.id, 'data': { 'left': this.state.leftCounts, 'right': this.state.rightCounts, 'leftChecks': this.state.leftChecks }} })
        }).then(function (response) {
            return response.json();
        }).then(function(data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    render() {
        var rows = [];
        for (var thing in this.props.displays) {
            let checkbox = null;
            if (this.state.leftChecks) {
                checkbox = <input className="requantify" type="checkbox" checked={this.state.leftChecks[thing]} onClick={(event) => this.setCheck(event.target.getAttribute("thing"))} key={thing + " lc"} thing={thing} />;
            }
            var row = <div className="requantifierRow" key={thing + " row"}><div className="quantity" key={thing + " left"}>{this.state.leftCounts[thing]}</div>
                {checkbox}
                <input className="requantify" type="button" value={this.state.rightCounts[thing] > 100 ? "<<100" : "<< all"} onClick={(event) => this.change(event.target.getAttribute("thing"), -100)} key={thing + " -100"} thing={thing} />
                <input className="requantify" type="button" value="<< 10" onClick={(event) => this.change(event.target.getAttribute("thing"), -10)} key={thing + " -10"} thing={thing} />
                <input className="requantify" type="button" value="<< 1" onClick={(event) => this.change(event.target.getAttribute("thing"), -1)} key={thing + " -1"} thing={thing} />
                <div className={"card " + this.props.displays[thing].type} key={thing + " card"}>{this.props.displays[thing].text}</div>
                <input className="requantify" type="button" value="1 >>" onClick={(event) => this.change(event.target.getAttribute("thing"), 1)} key={thing + " +1"} thing={thing} />
                <input className="requantify" type="button" value="10 >>" onClick={(event) => this.change(event.target.getAttribute("thing"), 10)} key={thing + " +10"} thing={thing} />
                <input className="requantify" type="button" value={this.state.leftCounts[thing] > 100 ? "100>>" : "all >>"} onClick={(event) => this.change(event.target.getAttribute("thing"), 100)} key={thing + " +100"} thing={thing} />
                < div className="quantity" key={thing + " right"}>{this.state.rightCounts[thing]}</div></div>;
            rows.push(row);
        }
        return <div className="screencover"><div className="requantifier"><div className="requantifierHeaderRow"><div className="requantifierLeftColumnHeader">{this.props.leftHeader}</div><div className="requantifierHeaderSpacer"><input type='button' disabled={!this.checkrules()} onClick={() => this.done()} value="Done" /></div><div className="requantifierRightColumnHeader">{this.props.rightHeader}</div></div>{rows}</div></div>;
    }
}

class Reassigner extends React.Component {
    constructor(props) {
        super(props);

        // track updated numbers as state.
        var leftSet = props.leftSet.slice();
        var rightSet = props.rightSet.slice();

        this.state = {
            leftSet: leftSet,
            rightSet: rightSet
        }
    }

    moveLeft(index) {
        var leftSet = this.state.leftSet.slice();
        var rightSet = this.state.rightSet.slice();
        var mover = rightSet.splice(index, 1)[0];
        leftSet.push(mover);
        this.setState({
            leftSet: leftSet,
            rightSet: rightSet
        });
    }

    moveRight(index) {
        var leftSet = this.state.leftSet.slice();
        var rightSet = this.state.rightSet.slice();
        var mover = leftSet.splice(index, 1)[0];
        rightSet.push(mover);
        this.setState({
            leftSet: leftSet,
            rightSet: rightSet
        });
    }
    
    done() {
        let self = this;
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': 'requantify', 'slot': saveSlot, 'id': self.props.id, 'data': { 'left': this.state.leftSet, 'right': this.state.rightSet } } })
        }).then(function (response) {
            return response.json();
        }).then(function(data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    render() {
        let self = this;
        let leftRows = self.state.leftSet.map((assignee, index) => {
            let row = self.props.displays[assignee.displayIndex].leftCards.map((card, subindex) => {
                return <div className={"card " + card.subtype} key={"left " + index + "-" + subindex} onClick={() => self.moveRight(index)}>{card.cardlines}</div>;
            });
            return <div className="reassignerRow" key={"left " + index}>{self.props.displays[assignee.displayIndex].display}: {row}</div>
        });
        let rightRows = self.state.rightSet.map((assignee, index) => {
            let row = self.props.displays[assignee.displayIndex].rightCards.map((card, subindex) => {
                return <div className={"card " + card.subtype} key={"right " + index + "-" + subindex} onClick={() => self.moveLeft(index)}>{card.cardlines}</div>;
            });
            return <div className="reassignerRow" key={"right " + index}>{self.props.displays[assignee.displayIndex].display}: {row}</div>
        });

        return <div className="screencover">
            <div className="reassigner">
                <div className="reassignerColumn">
                    <div className="reassignerLeftColumnHeader">{self.props.leftHeader}</div>
                    {leftRows}
                </div>
                <div className="reassignerSpacer">
                    <div className="reassignerHeaderSpacer">
                        <input type='button' onClick={() => self.done()} value="Done" />
                    </div>
                </div>
                <div className="reassignerColumn">
                    <div className="reassignerRightColumnHeader">{self.props.rightHeader}</div>
                    {rightRows}
                </div>
            </div>
        </div>;
    }
}

class Recombiner extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            leftSet: Object.assign({}, props.leftSet),
            rightSet: props.rightSet.slice(),
            leftSelect: 0,
            rightSelect: 0,
            displays: props.displays,
            id: props.id
        }
    }

    use() {
        let self = this;
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
                'body': {
                    'verb': 'use', 'slot': saveSlot, 'id': self.state.id, 'data': {
                        'item': self.item, 'user': { 'type': (self.state.rightSelect ? "pawn" : "leader"), 'index': (self.state.rightSelect - 1) } 
                    }
                }
            })
        }).then(function (response) {
            return response.json();
            }).then(function (data) {
                self.setState({
                    leftSet: Object.assign({},data.controls[0][0].leftSet),
                    rightSet: data.controls[0][0].rightSet.slice(),
                    displays: data.controls[0][0].displays.slice(),
                    id: data.controls[0][0].id,
                    frame: frame++,
                });
            }).catch(function (err) {
                setError();
            });
    }

    done() {
        let self = this;
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': 'setscene', 'slot': saveSlot, 'id': self.state.id } })
        }).then(function (response) {
            return response.json();
        }).then(function(data) {
            setGameState(data);
        }).catch(function (err) {
            setError();
        });
    }

    setLeftIndex(e) {
        let idx = parseInt(e.target.attributes["myindex"].value);
        this.setState({ leftSelect: idx });
    }

    setRightIndex(e) {
        let idx = parseInt(e.target.attributes["myindex"].value);
        this.setState({ rightSelect: idx });
    }

    render() {
        let self = this;
        let leftRows = [];
        var leftIndex = 0;
        for (var leftRow in self.state.leftSet) {
            let leftItem = self.state.leftSet[leftRow];
            let card = self.state.displays[leftItem.displayIndex];
            if (leftIndex == self.state.leftSelect)
                self.item = leftRow;
            leftRows.push(<div className="recombinerRow" key={"left " + leftIndex}>{leftItem.count + ' x '}<div className={"card " + card.type + (leftIndex == self.state.leftSelect ? " selectedCard" : "")} onClick={(e) => self.setLeftIndex(e)} myindex={leftIndex}>{card.text}</div></div>);
            leftIndex++;
        }
        let rightRows = self.state.rightSet.map((assignee, index) => {
            let card = self.state.displays[assignee.displayIndex];
            return <div className="recombinerRow" key={"right " + index}><div className={"card " + card.type + (index == self.state.rightSelect ? " selectedCard" : "")} onClick={(e) => self.setRightIndex(e)} myindex={index}>{card.text}</div></div>;
        });

        return <div className="screencover">
            <div className="recombiner">
                <div className="recombinerColumn">
                    <div className="recombinerColumnHeader">{self.props.leftHeader}</div>
                    {leftRows}
                </div>
                <div className="recombinerSpacer">
                    <div className="recombinerHeaderSpacer">
                        <input type='button' onClick={() => self.done()} value="Done" />
                    </div>
                    <div className="recombinerColumnSpacer">
                        <input type='button' onClick={() => self.use()} value="Use" disabled={leftIndex == 0} />
                    </div>
                </div>
                <div className="recombinerColumn">
                    <div className="recombinerColumnHeader">{self.props.rightHeader}</div>
                    {rightRows}
                </div>
            </div>
        </div>;
    }
}

class PercentBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {        
        let self = this;
        let left = Math.max(self.props.leftVal, 0);
        let right = Math.max(self.props.rightVal, 0);
        let multi = self.props.totalWidth / (left + right); 
        let leftWidth = multi * left;
        let rightWidth = multi * right;

        return (<div className="percentControl">
            <div className="percentLeft" style={{width: leftWidth,  height: self.props.height, backgroundColor: self.props.leftColor}}>
            </div>
            <div className="percentRight" style={{width: rightWidth,  height: self.props.height, backgroundColor: self.props.rightColor}}>
            </div>
            <div className="percentText" style={{width: self.props.totalWidth + 'px', height: self.props.height, top: 0, left: 0}}>{self.props.text}</div>
        </div>);
    }
}

class TextRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.props.queue.push(this);
        this.state = { remainingTime: this.props.pause, animationStarted: false };
    }

    animate() {
        if (!this.state.animationStarted) {
            this.setState({animationStarted: true});
            return;
        }
        if (this.animationDone()) {
            return;
        }
        this.setState((state, props) => { return { remainingTime: state.remainingTime - 25}});        
    }

    animationDone() { return this.state.remainingTime <= 0; }

    render() {        
        let self = this;
        return this.state.animationStarted && <div className="textControl">{self.props.text}</div>;
    }
}

class AttackRenderer extends React.Component {
    constructor(props) {
        props.blockWidth = parseInt(props.blockWidth);
        super(props);
        this.props.queue.push(this);
        this.state = this.calcStateFromAttack(props.attack);
    }

    calcStateFromAttack(attack) {        
        let cancel = attack.deflected;
        let crit = Math.max(attack.critZone || 0, 0);
        let hit = Math.max(attack.hitZone || 0, 0);
        let dodge = Math.max(attack.dodgeZone || 0, 0); 
        let miss = Math.max(attack.missZone || 0, 0);   
        let total = crit + hit + miss + dodge;
        let multi = this.props.blockWidth; 
        let dodgimation = 0;
        let dodgespeed = dodge;
        let totalWidth = multi * total;
        let critWidth = multi * crit;
        let hitWidth = multi * hit;
        let dodgeWidth = multi * dodge;
        let missWidth = multi * miss;
        let barWidth = multi;
        // For deflect, we use barLeftCurrent to track width instead of left.
        let barLeftFinal = attack.rtl ? 
            (multi * Math.max(Math.floor(attack.roll || Math.random() * total), 0) - 3) :
            (multi * Math.max(total - 1 - Math.floor(attack.roll), 0) - 3);

        let barLeftCurrent = attack.rtl ? 
            totalWidth:
            -multi - 3;
        let barspeed = multi;
        return {
            cancel: cancel,
            cancelBarWidth: -totalWidth,
            dodgimation: dodgimation,
            dodgeSpeed: dodgespeed,
            totalWidth: totalWidth,
            critWidth: critWidth,
            hitWidth: hitWidth,
            dodgeWidth: dodgeWidth,
            missWidth: missWidth,
            barWidth: barWidth,
            barLeftFinal: barLeftFinal,
            barTop: -3,
            barLeftCurrent: barLeftCurrent,
            barspeed: barspeed,
            cancelspeed: barspeed * 3,
            animationStarted: false
        };
    }

    animate() {
        if (!this.state.animationStarted) {
            this.setState({animationStarted: true});
            return;
        }
        if (this.animationDone()) {
            return;
        }
        let newState = Object.assign({}, this.state);
        newState.dodgimation = Math.min(newState.dodgimation + newState.dodgeSpeed, newState.dodgeWidth);
        if (newState.cancel) {
            newState.cancelBarWidth = Math.min(newState.cancelBarWidth + newState.cancelspeed, newState.totalWidth);
        }
        if (this.props.attack.rtl) {
            // RTL so move bar leftwards
            newState.barLeftCurrent -= newState.barspeed;
            if (newState.barLeftCurrent < newState.barLeftFinal) newState.barLeftCurrent = newState.barLeftFinal;
            if (newState.cancel && newState.cancelBarWidth >= newState.barLeftCurrent) {
                newState.barTop = (newState.barTop + 4) * 2 - 4;
            }
        } else {
            // LTR so move bar rightwards
            newState.barLeftCurrent += newState.barspeed;
            if (newState.barLeftCurrent > newState.barLeftFinal) newState.barLeftCurrent = newState.barLeftFinal;
            if (newState.cancel && (newState.totalWidth - newState.barWidth - newState.cancelBarWidth) <= newState.barLeftCurrent) {
                newState.barTop = (newState.barTop + 4) * 2 - 4;
            }
        }
        this.setState(newState);        
    }

    animationDone() { return this.state.dodgimation == this.state.dodgeWidth && 
        (this.state.cancel ?
        this.state.cancelBarWidth == this.state.totalWidth && this.state.barTop > 1000 :
        this.state.barLeftFinal == this.state.barLeftCurrent); 
    }

    render() {        
        if (!this.state.animationStarted) return null;
        let self = this;
        let attack = self.props.attack;        
        let cancelBarLeft = attack.rtl ? -2 : (self.state.totalWidth - self.state.cancelBarWidth - 2);
        let fakeHitWidth = self.state.hitWidth + self.state.dodgeWidth - self.state.dodgimation;
        let damageDisplay = null;        
        let flexDir = attack.rtl ? 'row-reverse' : 'row';
        if (this.animationDone() && attack.damage) {
            damageDisplay = [];
            let shields = attack.block || 0;
            attack.damage.forEach((d) => {
                for(let i = 0; i < d; i++) {
                    if (shields) {
                        damageDisplay.push(<div class={'damageUsedShield ' + attack.defendColors } />);
                        shields--;
                    } else {
                        if (attack.multiplier > 0) {
                            let cluster = [];    
                            let j = 0;                        
                            for(j = 0; j <= attack.multiplier - 1; j++) {
                                cluster.push(<div class={'damageTick ' + attack.attackColors } />);
                            }
                            if (j < attack.multiplier) {
                                // TODO: probably need to be tricksier about fractions in case of awkward type multipliers
                                cluster.push(<div class={'damageFraction ' + attack.attackColors } />);
                            }
                            damageDisplay.push(<div class='damageCluster'>{cluster}</div>);
                        } else {
                            damageDisplay.push(<div class='damageZero' />);
                        }
                    }
                }
                damageDisplay.push(<div class='damageSpacer'/>);
            });
            for(let i = 0; i < shields; i++) {
                damageDisplay.push(<div class='damageUnusedShield' />);
            }
        }
        return (<div className="attackControl" style={{'flex-direction':  flexDir}}>
                <div className="attackZones" style={{'flex-direction':  flexDir}}>
                    <div className="attackZone miss" style={{width: self.state.missWidth}} />
                    <div className={"attackZone dodge " + attack.defenderColors} style={{width: self.state.dodgimation}} />
                    <div className={"attackZone hit " + attack.attackColors } style={{width: fakeHitWidth}} />
                    <div className={"attackZone crit " + attack.attackColors } style={{width: self.state.critWidth}} />
                    { this.state.cancelBarWidth > 0 ?
                        <div className="attackCancelBar" style={{left: cancelBarLeft, width: self.state.cancelBarWidth}} />
                    : ''}
                    { this.state.barTop < 1000 ? 
                    <div className="attackBar" style={{width: self.state.barWidth, height: self.props.height, 
                        left: self.state.barLeftCurrent, top: self.state.barTop}} />
                    : ''}
                </div>
                <div className="attackResultText">{ this.animationDone() ? attack.result + '!' : ''}</div>
                <div className="damageZone"  style={{'flex-direction':  flexDir}}>
                { damageDisplay }
                </div>
            </div>);
    }
}
        
class GameDisplayer extends React.Component {
	constructor(props) {
        super(props);
        gameDisplayer = this;
        var log = [];
        var mLog = [];
        for (var i = 0; i < 100; i++) { log.push(''); mLog.push({})}; // Default chat log to empty
        this.animators = [];
		this.state = {
          chatLog: log,
          markupLog: mLog,
		  gameState: null,
          frame: frame,
          animationDone: false
		};
	}
    
    componentDidMount() {
        this.timerID = setInterval(
            () => this.animate(),
            25
        );
    }

    componentWillUnmount() {
        if (this.timerID)
            clearInterval(this.timerID);
    }

    animate() {
        let loop = this.state.gameState && this.state.gameState.profile && this.state.gameState.profile.fastAnimations;
        for(let iterations = (loop ? 100 : 1); iterations > 0; iterations--) {
            if (this.animators.length) {
                this.animators[0].animate();
                if (this.animators[0].animationDone())
                {
                    this.animators.shift();
                    this.setState({animationDone: (this.animators.length == 0)});
                }
            } else if (!this.state.animationDone) {
                this.setState({animationDone: true});
                break;
            } else {
                break;
            }
        }
    }

    stringFromMessageData(data) {
        var datestring = data.timestamp ? new Date(data.timestamp).toLocaleString() + ": " : "";
        var message = datestring + (data.username ? (data.username + '> ' + data.message) : data.message);
        return message;
    }

    markupFromMessageData(data) {
        var markup = {};
        //color
        if (data.type == 'system') {
            markup.color = '#0088FF';
        } else if (data.type == 'self' || (userid && data.userid == userid)) {
            markup.color = '#FF4400';
        }
        return markup;
    }

  	pushTextToChatLog = function(data) {
	  var newLog = this.state.chatLog.slice();
        newLog.shift();
        newLog.push(this.stringFromMessageData(data));
      var newMLog = this.state.markupLog.slice();
      newMLog.shift();
      newMLog.push(this.markupFromMessageData(data));
      this.setState({chatLog: newLog, markupLog: newMLog});
	};
	
	render() {
		let self = this;

        formData = {}; // Caution: if this causes unexpected rerenderers I might have issues with setting this here.
        if (this.state.gameState) {
            if (this.state.gameState.profile.darkTheme) {
                document.body.className = "darktheme";
            } else {
                document.body.className = "lighttheme";
            }
            if (!userid && this.state.gameState.id) userid = this.state.gameState.id;
            let controlTable = [];
            if (this.state.frame != frame) {
                this.animators = [];
                this.state.animationDone = false;
                this.state.frame = frame;
            }
            if (this.state.animationDone) {
                controlTable = this.state.gameState.controls.map((column, colIndex) => {
                    let controlColumn = [];
                    if (column) {
                        controlColumn = column.map((control, rowIndex) => {
                            switch (control.type) {
                                case 'actButton':
                                    return <ActButton key={colIndex * 10 + rowIndex} extendRight={control.extendRight} display={control.display} verb={control.verb} id={control.id} help={control.help} enabled={control.enabled} />;
                                case 'card':
                                    return <Card key={colIndex * 10 + rowIndex} display={control.display} verb={control.verb} id={control.id} help={control.help} enabled={control.enabled} count={control.count} />;
                                case 'navigator':
                                    return <Navigator key={colIndex * 10 + rowIndex} details={control.sub} id={control.id} />;
                                case 'textBox':
                                    return <TextInputer key={colIndex * 10 + rowIndex} id={control.id} default={control.default} name={control.name} />;
                                case 'refresher':
                                    return <Refresher />;
                                case 'reconnector':
                                    return <Reconnector />;
                                case 'requantifier':
                                    return <Requantifier key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftCounts={control.leftCounts} leftChecks={control.leftChecks} rightCounts={control.rightCounts} displays={control.displays} id={control.id} rules={control.rules}/>;
                                case 'reassigner':
                                    return <Reassigner key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftSet={control.leftSet} rightSet={control.rightSet} displays={control.displays} id={control.id} />;
                                case 'recombiner':
                                    return <Recombiner key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftSet={control.leftSet} rightSet={control.rightSet} displays={control.displays} id={control.id} />;
                                case 'itemCount':
                                    return <div key={colIndex * 10 + rowIndex} className="ctrlLabel">{control.display}</div>;
                                case 'spacer':
                                    return <div key={colIndex * 10 + rowIndex} className="ctrlLabel"></div>; 
                                default:
                                    return '';
                            }
                        });
                    }
                    return <div key={colIndex} className='controlColumn'>{controlColumn}</div>
                });
            }
            let statusDisplay = self.state.gameState.display.map((display, index) => {
                let key = "display_" + frame + "_" + index;
                if(display.type == "text") {
                    return <TextRenderer key={key} text={display.text} pause={display.pause || 0} style={display.style} queue={self.animators} frame={self.state.frame} />
                } else if (display.type == "attack") {
                    return <AttackRenderer key={key} blockWidth='10' attack={display} queue={self.animators} frame={self.state.frame}/>
                }
                return <div />;
            });
            return (<div><div className='topbar'><div className='topleft' /><div className='titlebar'>{this.state.gameState.title}</div><div className='topright' /></div><div className='statusWrapper'><LeftStatus source={this.state.gameState.leftStatus} /><div className='statusDisplay'>{statusDisplay}</div><RightStatus source={this.state.gameState.rightStatus} /></div><div className='controlTable'>{controlTable}</div><ChatDisplayer chatLog={this.state.chatLog} markupLog={this.state.markupLog}/></div>);
        } else if (this.state.saveList) {
            // initialize chat
            if (!this.chatInit) {
                this.chatInit = true;

                fetch('/chat', {
                    method: 'get'
                }).then(function (response) {
                    return response.json();
                }).then(function (chatlog) {
                    if (chatlog && chatlog.length) {
                        var config = chatlog[0];

                        pusher = new Pusher(config.key, {
                            cluster: config.cluster,
                            forceTLS: true
                        });
                        var channel = pusher.subscribe('Redscale_main_chat');
                        channel.bind('chat message', self.pushTextToChatLog.bind(self));

                        var newLog = self.state.chatLog.slice(1);
                        var newMLog = self.state.markupLog.slice(1);
                        chatlog.forEach(function (data) {
                            if (data) {
                                newLog.shift();
                                newLog.push(self.stringFromMessageData(data));
                                newMLog.shift();
                                newMLog.push(self.markupFromMessageData(data));
                            }
                        });
                        self.setState({ chatLog: newLog, markupLog: newMLog });
                    } else {
                        self.setState({ chatLog: ["Local server is not configured for live chat."], markupLog: [{}]})
                    }
                });
            }

            let newSlot = 0;
            let saveTable = this.state.saveList.map((save) => {
                if (parseInt(save.slot, 10) >= newSlot) newSlot = parseInt(save.slot, 10) + 1; 
                return <Loader key={save.slot} slot={save.slot} text={save.text} />;
            });
            return <div className='saveList'>{saveTable}<Loader slot={newSlot} key={newSlot} text='Start a new game.' /></div>;
        } else {		
		    return (<div><div>Welcome, {name}. Please wait while we load your game state.</div><ChatDisplayer chatLog={this.state.chatLog}  markupLog={this.state.markupLog}/></div>);
		}
	}
}

//-------------------------------------------------------//

ReactDOM.render(
  <GameDisplayer />,
  document.getElementById('reactroot')
);

getSaveList();