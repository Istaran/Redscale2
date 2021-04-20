GameDisplayer.registerWidget(10, (gamestate) => {
    return <FileMenu />
});

class FileMenu extends Widget {
    constructor(props) {
        super(props, "file");

    }

    renderInternal() {        
        let self = this;
        return null;
    }
}