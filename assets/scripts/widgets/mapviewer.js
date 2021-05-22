GameDisplayer.registerWidget(6, (gamestate) => {
    return gamestate.profile.earlyAccess && <MapViewer />
});

class MapViewer extends Widget {
    constructor(props) {
        super(props, "map");

    }

    open() {
        let self = this;
        fetch('/map?slot=' + GameDisplayer.saveSlot, {
            method: 'get'
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.setState({ map: data });
        }).catch(function (err) {
            setError();
        });
        super.open();
    }

    renderInternal() {        
        let self = this;
        if (!this.state.map) return null;

        let levels = this.state.map.map((level, levelIdx) => {
            if (level) {
                let rows = level.map((row, rowIdx) => {
                    if (row) {
                        let rooms = row.map((room, roomIdx) => {
                            if (room) {
                                return <MapCell details={room} row={rowIdx + 1} col={roomIdx + 1} />;
                            }
                        });
                        return rooms;
                    }
                });
                return <div class="map-level">{rows}</div>;
            }
        });
        return <div class="map">{ levels }</div>;
    }
}