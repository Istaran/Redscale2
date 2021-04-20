GameDisplayer.registerWidget(10, (gamestate) => {
    return <FileMenu />
});

class FileMenu extends Widget {
    constructor(props) {
        super(props, "file");
        let self = this;

    }

    open() {
        let self = this;
        this.setState({ saveList: null });
        fetch('/list', {
            method: 'get'
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.setState({ saveList: data });
        }).catch(function (err) {
            setError();
        });
        super.open();
    }

    renderInternal() {        
        let self = this;
        if (!this.state.saveList) return null;
        let newSlot = 0;
        let saveTable = this.state.saveList.map((save) => {
            if (parseInt(save.slot, 10) >= newSlot) newSlot = parseInt(save.slot, 10) + 1; 
            return <Loader key={save.slot} slot={save.slot} text={save.text} />;
        });
        return <div className='saveList'>{saveTable}<Loader slot={newSlot} key={newSlot} text='Start a new game.' /></div>;
    }
}