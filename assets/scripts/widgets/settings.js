GameDisplayer.registerWidget(2, (gamestate) => {
    return <Settings profile={gamestate.profile} />
});

class Settings extends Widget {
    constructor(props) {
        super(props, "settings");
        this.state = Object.assign({}, props.profile);        
    }

    manualChange(settings) {
        let self=this;
        fetch('/set', {
            method: 'post',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ 'body': settings })
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.setState(data);
            getStatus();
        }).catch(function (err) {
            setError();
        });
    }

    renderInternal() {        
        let self = this;        
        return <div>
            <input type='button' className='actButton' onClick={() => self.manualChange({darkTheme: !self.state.darkTheme})} value='Toggle Theme' />
            <input type='button' className='actButton' onClick={() => self.manualChange({fastAnimations: !self.state.fastAnimations})} value='Toggle Fast Animations' />
        </div>;
    }
}