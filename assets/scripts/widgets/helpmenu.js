GameDisplayer.registerWidget(0, (gamestate) => {
    return <HelpMenu />
});

class HelpMenu extends Widget {
    constructor(props) {
        super(props, "help");

    }

    renderInternal() {        
        let self = this;
        return null;
    }
}