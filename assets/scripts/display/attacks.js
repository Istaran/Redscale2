registerDisplay('attack', (frame, index, display) => {
    return <AttackRenderer key={frame + '-' + index} blockWidth='10' attack={display} queue={GameDisplayer.animators} frame={frame}/>
});

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
                    <div className={"attackZone dodge " + attack.defendColors} style={{width: self.state.dodgimation}} />
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