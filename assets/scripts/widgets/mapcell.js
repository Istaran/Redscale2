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
        if (this.props.details.north) outarrows.push(<polygon points="37.5,12.5 50,25 62.5,12.5" fill={this.props.details.north.light || compassLight} stroke={this.props.details.north.dark || compassDark} strokeWidth="0"  />)
        if (this.props.details.west) outarrows.push(<polygon points="12.5,37.5 25,50 12.5,62.5" fill={this.props.details.west.light || compassLight} stroke={this.props.details.west.dark || compassDark} strokeWidth="0"  />)
        if (this.props.details.east) outarrows.push(<polygon points="87.5,37.5 75,50 87.5,62.5" fill={this.props.details.east.light || compassLight} stroke={this.props.details.east.dark || compassDark} strokeWidth="0"  />)
        if (this.props.details.south) outarrows.push(<polygon points="37.5,87.5 50,75 62.5,87.5" fill={this.props.details.south.light || compassLight} stroke={this.props.details.south.dark || compassDark} strokeWidth="0"  />)

        if (this.props.details.nw) outarrows.push(<polygon points="25,25 25,0 0,25" fill={this.props.details.nw.light || compassLight} stroke={this.props.details.nw.dark || compassDark} strokeWidth="0"  />)
        if (this.props.details.sw) outarrows.push(<polygon points="25,75 25,100 0,75" fill={this.props.details.sw.light || compassLight} stroke={this.props.details.sw.dark || compassDark} strokeWidth="0"  />)
        if (this.props.details.ne) outarrows.push(<polygon points="75,25 75,0 100,25" fill={this.props.details.ne.light || compassLight} stroke={this.props.details.ne.dark || compassDark} strokeWidth="0"  />)
        if (this.props.details.se) outarrows.push(<polygon points="75,75 75,100 100,75" fill={this.props.details.se.light || compassLight} stroke={this.props.details.se.dark || compassDark} strokeWidth="0"  />)

        return <svg className='map-cell' width='300' height='300' style={gridStyle}>
            <polygon points="37.5,37.5 62.5,37.5 62.5,62.5 37.5,62.5" fill={hereColor} />

            <polygon points="50,37.5 55,42.5 45,42.5" stroke={upColor2} fill={upColor} strokeWidth="2" />
            <polygon points="50,62 55,57.5 45,57.5" stroke={downColor2}  fill={downColor} strokeWidth="2" />            
            <circle cx='50' cy='50' r='5' stroke={specialColor2}  fill={specialColor} strokeWidth="2" />

            <polygon points="25,25 25,50 50,25" fill={nwColor} stroke={hereColor2} strokeWidth="0" />
            <polygon points="25,75 25,50 50,75" fill={swColor} stroke={hereColor2} strokeWidth="0" />
            <polygon points="75,25 75,50 50,25" fill={neColor} stroke={hereColor2} strokeWidth="0" />
            <polygon points="75,75 75,50 50,75" fill={seColor} stroke={hereColor2} strokeWidth="0" />

            <polygon points="37.5,37.5 50,25 62.5,37.5" fill={northColor} stroke={hereColor2} strokeWidth="0"  />
            <polygon points="37.5,37.5 25,50 37.5,62.5" fill={westColor} stroke={hereColor2} strokeWidth="0" />
            <polygon points="62.5,37.5 75,50 62.5,62.5" fill={eastColor} stroke={hereColor2} strokeWidth="0" />
            <polygon points="37.5,62.5 50,75 62.5,62.5" fill={southColor} stroke={hereColor2} strokeWidth="0" />
            {outarrows}
		</svg>;
	}	
}