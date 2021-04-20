GameDisplayer.registerWidget(2, (gamestate) => {
    return <Settings />
});

class Settings extends Widget {
    constructor(props) {
        super(props, "settings");

    }

    renderInternal() {        
        let self = this;
        return null;
    }
}