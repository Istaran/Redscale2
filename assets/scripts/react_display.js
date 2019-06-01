var pusher = new Pusher('91450cc1727e582f15c1', {
  cluster: 'us2',
  forceTLS: true
});

var helper;
var gameDisplayer;
var formData = {};
var saveSlot = 0;

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
        gameDisplayer.setState({ gameState: data });
    }).catch(function (err) {
        gameDisplayer.setState({ gameState: { status: "There was an error trying to load your game. Click refresh when you want to try again. If the problem persists, email istaran@redscalesadventure.online and include your google email address for reference.", controls: [[{ type: "refresher" }]] } });
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
        gameDisplayer.setState({ gameState: { status: "There was an error trying to load your save list. Click reconnect when you want to try again. If the problem persists, email istaran@redscalesadventure.online and include your google email address for reference.", controls: [[{ type: "reconnector" }]] } });
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
		let chatDisplay = this.props.chatLog.map((text, index) => { return (<tr key={index}><td>{text}</td></tr>); });
		
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
	
	takeAction = function() {
        let self = this;
        helper.setState({ help: null });
		fetch('/act' + location.search, {
				method: 'post',
				headers: {
				   "Content-Type": "application/json; charset=utf-8",
				},
            body: JSON.stringify({ 'body': { 'verb': self.props.verb, 'slot': saveSlot, 'id': self.props.id, 'data': formData }})
			  }).then(function(response) {
				return response.json();
			  }).then(function(data) {
                  gameDisplayer.setState({gameState: data});
			  });
	}
	
	render() {
        return <input type='button' className='actButton' onClick={(event) => this.takeAction(event)} value={this.props.display} disabled={!this.props.enabled} onMouseOver={(event) => helper.setState({ help: this.props.help })} onMouseOut={(event) => helper.setState({ help: null })} />;
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
            gameDisplayer.setState({ gameState: data });
        }).catch(function (err) {
            gameDisplayer.setState({ gameState: { status: "There was an error trying to do that. Click refresh to restore your controls, or email istaran@redscalesadventure.online if your problem persists.", controls: [[{ type: "refresher" }]] } });
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
                  gameDisplayer.setState({gameState: data});
              }).catch(function (err) {
                  gameDisplayer.setState({ gameState: { status: "There was an error trying to go there. Click refresh to restore your controls, or email istaran@redscalesadventure.online if your problem persists.", controls: [[{ type: "refresher" }]] } });
              });
		}
	}
	
    render() {
        let backgroundColor = "silver";
        let compassLight = "white";
        let compassDark = "black";
        let compassDisabled = "silver";
        let upColor = (this.props.details.up) ? this.props.details.up.light || "white" : compassLight;
        let upColor2 = (this.props.details.up) ? this.props.details.up.dark || "skyblue" : compassDisabled;
        let northColor = (this.props.details.north) ? this.props.details.north.light || "red" : compassDisabled;
        let northColor2 = (this.props.details.north) ? this.props.details.north.dark || "darkred" : compassDisabled;
        let westColor = (this.props.details.west) ? this.props.details.west.light || compassLight : compassDisabled;
        let westColor2 = (this.props.details.west) ? this.props.details.west.dark || compassDark : compassDisabled;
        let specialColor = (this.props.details.special) ? this.props.details.special.light || compassLight : backgroundColor;
        let specialColor2 = (this.props.details.special) ? this.props.details.special.dark || compassDark : backgroundColor;
        let eastColor = (this.props.details.east) ? this.props.details.east.light || compassLight : compassDisabled;
        let eastColor2 = (this.props.details.east) ? this.props.details.east.dark || compassDark : compassDisabled;
        let southColor = (this.props.details.south) ? this.props.details.south.light || compassLight : compassDisabled;
        let southColor2 = (this.props.details.south) ? this.props.details.south.dark || compassDark : compassDisabled;
        let nwColor = (this.props.details.nw) ? this.props.details.nw.light || compassLight : compassDisabled;
        let nwColor2 = (this.props.details.nw) ? this.props.details.nw.dark || compassDark : compassDisabled;
        let neColor = (this.props.details.ne) ? this.props.details.ne.light || compassLight : compassDisabled;
        let neColor2 = (this.props.details.ne) ? this.props.details.ne.dark || compassDark : compassDisabled;
        let swColor = (this.props.details.sw) ? this.props.details.sw.light || compassLight : compassDisabled;
        let swColor2 = (this.props.details.sw) ? this.props.details.sw.dark || compassDark : compassDisabled;
        let seColor = (this.props.details.se) ? this.props.details.se.light || compassLight : compassDisabled;
        let seColor2 = (this.props.details.se) ? this.props.details.se.dark || compassDark : compassDisabled;
        let downColor = (this.props.details.down) ? this.props.details.down.light || "lime" : compassDisabled;
        let downColor2 = (this.props.details.down) ? this.props.details.down.dark || "peru" : compassDark;
        let hereColor = (this.props.details.here) ? this.props.details.here.light || compassLight : compassDisabled;
        let hereColor2 = (this.props.details.here) ? this.props.details.here.dark || compassDark : compassDisabled;


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
            <polygon points="43,0 0,43 149,43 106,0" fill="url(#skyGradient)" onClick={(event) => this.navigate(event, 'up')} />
            <polygon points="0,48 0,98 149,98, 149,48" fill="url(#hereGradient)" />
            <polygon points="0,103 43,146 106,146, 149,103" fill="url(#groundGradient)" onClick={(event) => this.navigate(event, 'down')} />
            <circle cx='75' cy='73' r='50' fill={backgroundColor} stroke="black" strokeWidth="3" />
            <line x1="36.3" y1="50.5" x2="32" y2="48" stroke="black" strokeWidth="1" />
            <line x1="36.3" y1="95.5" x2="32" y2="98" stroke="black" strokeWidth="1" />
            <line x1="113.7" y1="50.5" x2="118" y2="48" stroke="black" strokeWidth="1" />
            <line x1="113.7" y1="95.5" x2="118" y2="98" stroke="black" strokeWidth="1" />
            <line x1="52.5" y1="34.3" x2="50" y2="30" stroke="black" strokeWidth="1" />
            <line x1="52.5" y1="111.7" x2="50" y2="116" stroke="black" strokeWidth="1" />
            <line x1="97.5" y1="34.3" x2="100" y2="30" stroke="black" strokeWidth="1" />
            <line x1="97.5" y1="111.7" x2="100" y2="116" stroke="black" strokeWidth="1" />
            <line x1="31.5" y1="61.4" x2="27" y2="60" stroke="black" strokeWidth="1" />
            <line x1="31.5" y1="84.6" x2="27" y2="86" stroke="black" strokeWidth="1" />
            <line x1="118.5" y1="61.4" x2="123" y2="60" stroke="black" strokeWidth="1" />
            <line x1="118.5" y1="84.6" x2="123" y2="86" stroke="black" strokeWidth="1" />
            <line x1="63.4" y1="29.5" x2="62" y2="25" stroke="black" strokeWidth="1" />
            <line x1="63.4" y1="116.5" x2="62" y2="121" stroke="black" strokeWidth="1" />
            <line x1="86.6" y1="29.5" x2="88" y2="25" stroke="black" strokeWidth="1" />
            <line x1="86.6" y1="116.5" x2="88" y2="121" stroke="black" strokeWidth="1" />
            <polygon points="40,38 65,63 75,53" fill={nwColor} stroke="black" strokeWidth="1" onClick={(event) => this.navigate(event, 'nw')} />
            <polygon points="40,38 55,73 65,63" fill={nwColor2} stroke="black" strokeWidth="1" onClick={(event) => this.navigate(event, 'nw')} />
            <polygon points="40,108 55,73 65,83" fill={swColor} stroke="black" strokeWidth="1" onClick={(event) => this.navigate(event, 'sw')} />
            <polygon points="40,108 65,83 75,93" fill={swColor2} stroke="black" strokeWidth="1" onClick={(event) => this.navigate(event, 'sw')} />
            <polygon points="110,38 85,63 75,53" fill={neColor} stroke="black" strokeWidth="1" onClick={(event) => this.navigate(event, 'ne')} />
            <polygon points="110,38 95,73 85,63" fill={neColor2} stroke="black" strokeWidth="1" onClick={(event) => this.navigate(event, 'ne')} />
            <polygon points="110,108 95,73 85,83" fill={seColor} stroke="black" strokeWidth="1" onClick={(event) => this.navigate(event, 'se')} />
            <polygon points="110,108 85,83 75,93" fill={seColor2} stroke="black" strokeWidth="1" onClick={(event) => this.navigate(event, 'se')} />


            <polygon points="75,22 65,63 75,58" stroke="black" strokeWidth="1" fill={northColor} onClick={(event) => this.navigate(event, 'north')} />
            <polygon points="75,22 75,58 85,63" stroke="black" strokeWidth="1" fill={northColor2} onClick={(event) => this.navigate(event, 'north')} />
            <polygon points="25,73 65,63 60,73" stroke="black" strokeWidth="1" fill={westColor} onClick={(event) => this.navigate(event, 'west')} />
            <polygon points="25,73 60,73 65,83" stroke="black" strokeWidth="1" fill={westColor2} onClick={(event) => this.navigate(event, 'west')}  />
            <circle cx='75' cy='73' r='10' fill="url(#specialGradient)" onClick={(event) => this.navigate(event, 'special')} />
            <polygon points="124,73 85,63 89,73" stroke="black" strokeWidth="1" fill={eastColor} onClick={(event) => this.navigate(event, 'east')} />
            <polygon points="124,73 89,73 85,83" stroke="black" strokeWidth="1" fill={eastColor2} onClick={(event) => this.navigate(event, 'east')} />
            <polygon points="75,122 65,83 75,87" stroke="black" strokeWidth="1" fill={southColor} onClick={(event) => this.navigate(event, 'south')}  />
            <polygon points="75,122 75,87 85,83" stroke="black" strokeWidth="1" fill={southColor2} onClick={(event) => this.navigate(event, 'south')} />


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
        var thing;
        for (thing in props.displays) {
            leftCounts[thing] = leftCounts[thing] || 0;
            rightCounts[thing] = rightCounts[thing] || 0;
        }

        this.state = {
            leftCounts: leftCounts,
            rightCounts: rightCounts
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
            rightCounts: Object.assign({}, this.state.rightCounts)
        };
        newState.leftCounts[thing] = this.state.leftCounts[thing] - deltaRight;
        newState.rightCounts[thing] = this.state.rightCounts[thing] + deltaRight;
        this.setState(newState);
    }

    done() {
        let self = this;
        fetch('/act' + location.search, {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': { 'verb': 'requantify', 'slot': saveSlot, 'id': self.props.id, 'data': { 'left': this.state.leftCounts, 'right': this.state.rightCounts }} })
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            gameDisplayer.setState({ gameState: data });
        }).catch(function (err) {
            gameDisplayer.setState({ gameState: { status: "There was an error trying to do that. Click refresh to restore your controls, or email istaran@redscalesadventure.online if your problem persists.", controls: [[{ type: "refresher" }]] } });
        });
    }

    render() {
        var rows = [];
        for (var thing in this.props.displays) {
            var row = <div className="requantifierRow" key={thing + " row"}><div className="quantity" key={thing + " left"}>{this.state.leftCounts[thing]}</div>
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
        return <div className="screencover"><div className="requantifier"><div className="requantifierHeaderRow"><div className="requantifierColumnHeader">{this.props.leftHeader}</div><div className="requantifierHeaderSpacer"><input type='button' disabled={!this.checkrules()} onClick={() => this.done()} value="Done" /></div><div className="requantifierColumnHeader">{this.props.rightHeader}</div></div>{rows}</div></div>;
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
        }).then(function (data) {
            gameDisplayer.setState({ gameState: data });
        }).catch(function (err) {
            gameDisplayer.setState({ gameState: { status: "There was an error trying to do that. Click refresh to restore your controls, or email istaran@redscalesadventure.online if your problem persists.", controls: [[{ type: "refresher" }]] } });
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
                    <div className="reassignerColumnHeader">{self.props.leftHeader}</div>
                    {leftRows}
                </div>
                <div className="reassignerSpacer">
                    <div className="reassignerHeaderSpacer">
                        <input type='button' onClick={() => self.done()} value="Done" />
                    </div>
                </div>
                <div className="reassignerColumn">
                    <div className="reassignerColumnHeader">{self.props.rightHeader}</div>
                    {rightRows}
                </div>
            </div>
        </div>;
    }
}
        
class GameDisplayer extends React.Component {
	constructor(props) {
        super(props);
        gameDisplayer = this;
		var log = [];
        for (var i = 0; i < 100; i++) { log.push(''); }; // Default chat log to empty
		this.state = {
		  chatLog: log,
		  gameState: null,
		};
	}

    stringFromMessageData(data) {
        var datestring = data.timestamp ? new Date(data.timestamp).toLocaleString() + ": " : "Unknown time & date: ";
        var message = datestring + (data.username ? (data.username + '> ' + data.message) : data.message);
        return message;
    }

  	pushTextToChatLog = function(data) {
	  var newLog = this.state.chatLog.slice();
            newLog.shift();
            newLog.push(this.stringFromMessageData(data));
	  this.setState({chatLog: newLog});
	};
	
	render() {
		let self = this;
        formData = {}; // Caution: if this causes unexpected rerenderers I might have issues with setting this here.
        if (this.state.gameState) {
            let controlTable = this.state.gameState.controls.map((column, colIndex) => {
                let controlColumn = [];
                if (column) {
                    controlColumn = column.map((control, rowIndex) => {
                        switch (control.type) {
                            case 'actButton':
                                return <ActButton key={colIndex * 10 + rowIndex} display={control.display} verb={control.verb} id={control.id} help={control.help} enabled={control.enabled} />;
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
                                return <Requantifier key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftCounts={control.leftCounts} rightCounts={control.rightCounts} displays={control.displays} id={control.id} rules={control.rules}/>;
                            case 'reassigner':
                                return <Reassigner key={colIndex * 10 + rowIndex} leftHeader={control.leftHeader} rightHeader={control.rightHeader} leftSet={control.leftSet} rightSet={control.rightSet} displays={control.displays} id={control.id} />;
                            default:
                                return '';
                        }
                    });
                }
                return <div key={colIndex} className='controlColumn'>{controlColumn}</div>
            });

            return (<div><div className='topbar'><div className='topleft' /><div className='titlebar'>{this.state.gameState.title}</div><div className='topright' /></div><div className='statusWrapper'><LeftStatus source={this.state.gameState.leftStatus} /><div className='statusDisplay'>{this.state.gameState.status}</div><RightStatus source={this.state.gameState.rightStatus} /></div><div className='controlTable'>{controlTable}</div><ChatDisplayer chatLog={this.state.chatLog} /></div>);
        } else if (this.state.saveList) {
            // initialize chat
            if (!this.chatInit) {
                this.chatInit = true;
                var channel = pusher.subscribe('Redscale_main_chat');
                channel.bind('chat message', self.pushTextToChatLog.bind(self));

                fetch('/chat', {
                    method: 'get'
                }).then(function (response) {
                    return response.json();
                }).then(function (chatlog) {
                    if (chatlog && chatlog.length) {

                        var newLog = self.state.chatLog.slice();
                        chatlog.forEach(function (data) {
                            if (data) {
                                newLog.shift();
                                newLog.push(self.stringFromMessageData(data));
                            }
                        });
                        self.setState({ chatLog: newLog });
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
		    return (<div><div>Welcome, {name}. Please wait while we load your game state.</div><ChatDisplayer chatLog={this.state.chatLog} /></div>);
		}
	}
}

//-------------------------------------------------------//

ReactDOM.render(
  <GameDisplayer />,
  document.getElementById('reactroot')
);

getSaveList();