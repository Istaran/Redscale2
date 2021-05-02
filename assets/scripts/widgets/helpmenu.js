GameDisplayer.registerWidget(0, (gamestate) => {
    return gamestate.profile.earlyAccess && <HelpMenu />
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