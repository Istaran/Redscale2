GameDisplayer.registerControl('navigator', (colIndex, rowIndex, control) => {
    return <Navigator key={colIndex * 10 + rowIndex} details={control.sub} id={control.id} />;
});

class Navigator extends React.Component {
	constructor(props) {
		super(props);
        this.state = {};
	};
	
	navigate(event, dir) {
        let id = this.props.id;
        setHelp(null);
		if (this.props.details[dir] && !this.state.navigating) {
            this.setState({navigating: true});
            fetch('/act' + location.search, {
				method: 'post',
				headers: {
				   "Content-Type": "application/json; charset=utf-8",
				},
                body: JSON.stringify({ 'body': { 'verb': 'travel', 'slot': GameDisplayer.saveSlot, 'id': id, 'sub': dir }})
			  }).then(function(response) {
				return response.json();
			  }).then(function(data) {
                setGameState(data);
              }).catch(function (err) {
                setError();
              });
		}
	}

    onKeyDown(event) {
        var gameState = getGameState();
        if (gameState && gameState.profile.earlyAccess) {
            switch(event.keyCode) {
                case 103: // numpad 7
                    this.navigate(event, 'nw');
                    break;
                case 104: // numpad 8
                    this.navigate(event, 'north');
                    break;
                case 105: // numpad 9
                    this.navigate(event, 'ne');
                    break;
                case 100: // numpad 4
                    this.navigate(event, 'west');
                    break;
                case 101: // numpad 5
                    this.navigate(event, 'special');
                    break;
                case 102: // numpad 6
                    this.navigate(event, 'east');
                    break;
                case 97: // numpad 1
                    this.navigate(event, 'sw');
                    break;
                case 98: // numpad 2
                    this.navigate(event, 'south');
                    break;
                case 99: // numpad 3
                    this.navigate(event, 'se');
                    break;
                case 107: // numpad +
                    this.navigate(event, 'down');
                    break;
                case 109: // numpad -
                    this.navigate(event, 'up');
                    break;
                default:
                    break;
            }
        }
    }

    componentDidMount(){
        document.addEventListener("keydown", this.onKeyDown.bind(this));
    }    
    
    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown.bind(this));
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
                navHelp += `${header}: ${this.props.details[dir.prop].text}\n`;
            }
        }

        return <svg className='navigator' width='150' height='145' onMouseOver={() => setHelp(navHelp)} onMouseOut={() => setHelp(null)}>
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