GameDisplayer.registerWidget(6, (gamestate) => {
    return <MapViewer />
});

class MapViewer extends Widget {
    constructor(props) {
        super(props, "map");

    }

    renderInternal() {        
        let self = this;
        return null;
    }
}