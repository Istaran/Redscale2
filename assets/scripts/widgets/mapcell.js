class MapCell extends React.Component {
	constructor(props) {
		super(props);
	};
	
    render() {
        let compassLight = "var(--compass-light-color)";
        let compassDark = "var(--compass-dark-color)";
        let compassDisabled =  "var(--compass-ds-color)";
        
        let hereColor = (this.props.details.here) ? this.props.details.here.light || compassLight : compassDisabled;
        let hereColor2 = (this.props.details.here) ? this.props.details.here.dark || compassDark : compassDisabled;

        let upColor = (this.props.details.up) ? this.props.details.up.light || compassLight : hereColor;
        let upColor2 = (this.props.details.up) ? this.props.details.up.dark || compassDark : hereColor;
        let specialColor = (this.props.details.special) ? this.props.details.special.light || compassLight : hereColor;
        let specialColor2 = (this.props.details.special) ? this.props.details.special.dark || compassDark : hereColor;
        let downColor = (this.props.details.down) ? this.props.details.down.light || compassLight : hereColor;
        let downColor2 = (this.props.details.down) ? this.props.details.down.dark || compassDark : hereColor;

        let northColor = (this.props.details.north) ? hereColor : hereColor2;
        let westColor = (this.props.details.west) ? hereColor : hereColor2;
        let eastColor = (this.props.details.east) ? hereColor : hereColor2;
        let southColor = (this.props.details.south) ? hereColor : hereColor2;
        let nwColor = (this.props.details.nw) ? hereColor : hereColor2;
        let neColor = (this.props.details.ne) ? hereColor : hereColor2;
        let swColor = (this.props.details.sw) ? hereColor : hereColor2;
        let seColor = (this.props.details.se) ? hereColor : hereColor2;

        let gridStyle = {
            gridColumn: this.props.col,
            gridRow: this.props.row
        };

        let outarrows = [];
        if (this.props.details.north && !this.props.details.north.visited) {
            outarrows.push(<g>
                <title>{this.props.details.north.text}</title>
                <polygon points="46,20 50,9 54,20 50,24" fill={this.props.details.north.light || compassLight} stroke={this.props.details.north.dark || compassDark} />
            </g>);
        }
        if (this.props.details.west && !this.props.details.west.visited) {
            outarrows.push(<g>
                <title>{this.props.details.west.text}</title>
                <polygon points="20,46 9,50 20,54 24,50" fill={this.props.details.west.light || compassLight} stroke={this.props.details.west.dark || compassDark} />
            </g>);
        }
        if (this.props.details.east && !this.props.details.east.visited) {
            outarrows.push(<g>
                <title>{this.props.details.east.text}</title>
                <polygon points="80,46 91,50 80,54 76,50" fill={this.props.details.east.light || compassLight} stroke={this.props.details.east.dark || compassDark} />
            </g>);
        }
        if (this.props.details.south && !this.props.details.south.visited) {
            outarrows.push(<g>
                <title>{this.props.details.south.text}</title>
                <polygon points="46,80 50,91 54,80 50,76" fill={this.props.details.south.light || compassLight} stroke={this.props.details.south.dark || compassDark} />
            </g>);
        }

        if (this.props.details.nw && !this.props.details.nw.visited) {
            outarrows.push(<g>
                <title>{this.props.details.nw.text}</title>
                <polygon points="16,16 10,16 6,6 16,10" fill={this.props.details.nw.light || compassLight} stroke={this.props.details.nw.dark || compassDark} />
            </g>);
        }
        if (this.props.details.sw && !this.props.details.sw.visited) {
            outarrows.push(<g>
                <title>{this.props.details.sw.text}</title>
                <polygon points="16,84 10,84 6,94 16,90" fill={this.props.details.sw.light || compassLight} stroke={this.props.details.sw.dark || compassDark} />
            </g>);
        }
        if (this.props.details.ne && !this.props.details.ne.visited) {
            outarrows.push(<g>
                <title>{this.props.details.ne.text}</title>
                <polygon points="84,16 90,16 94,6 84,10" fill={this.props.details.ne.light || compassLight} stroke={this.props.details.ne.dark || compassDark} />
            </g>);
        }
        if (this.props.details.se && !this.props.details.se.visited) {
            outarrows.push(<g>
                <title>{this.props.details.se.text}</title>
                <polygon points="84,84 90,84 94,94 84,90" fill={this.props.details.se.light || compassLight} stroke={this.props.details.se.dark || compassDark} />
            </g>);
        }

        if (this.props.details.YouAreHere) {
            outarrows.push(
                <circle cx="50" cy="50" r="20" stroke={hereColor2} strokeWidth="2" fill="none">
                    <animate attributeName="stroke" values={"red;" + hereColor2 + ";red"} dur="4s" repeatCount="indefinite" />
                </circle>
            );
        }

        return <svg className='map-cell' width='300' height='300' style={gridStyle}>
            <g>
                <title>{this.props.details.here.title + (this.props.details.YouAreHere ? " - You are here" : "")}</title>
                <rect x="25" y="25" width="50" height="50" fill={hereColor} stroke={hereColor2} />

                <polygon points="25,25 25,40 40,40 40,25" fill={nwColor} />
                <polygon points="25,75 25,60 40,60 40,75" fill={swColor} />
                <polygon points="75,25 75,40 60,40 60,25" fill={neColor} />
                <polygon points="75,75 75,60 60,60 60,75" fill={seColor} />

                <polygon points="40,25 40,40 60,40 60,25" fill={northColor} />
                <polygon points="25,40 40,40 40,60 25,60" fill={westColor} />
                <polygon points="75,40 60,40 60,60 75,60" fill={eastColor} />
                <polygon points="40,75 40,60 60,60 60,75" fill={southColor} />

                <circle cx='50' cy='50' r='3' stroke={specialColor2} fill={specialColor} strokeWidth="2" />
                <polygon points="50,40 55,45 45,45" stroke={upColor2} fill={upColor} strokeWidth="2" />
                <polygon points="50,60 55,55 45,55" stroke={downColor2} fill={downColor} strokeWidth="2" />
            </g>
            {outarrows}

        </svg>;
	}	
}