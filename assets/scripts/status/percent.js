registerStatus('percent', (side, index, status) => {
    return <PercentBar  key={side + '-' + index} leftVal={status.leftVal} rightVal={status.rightVal} leftColor={status.leftColor} rightColor={status.rightColor} totalWidth='200' height='18px' text={status.text}></PercentBar>
});

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