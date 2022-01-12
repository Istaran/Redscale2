GameDisplayer.registerWidget(6, (gamestate) => {
    return <MapViewer />
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
            let location = data.current;
            let map = data;
            map.current = undefined;
            self.setState({ map: map, location: location, you: location });

        }).catch(function (err) {
            setError();
        });
        super.open();
    }

    setLevel(l) {
        let loc = this.state.location;
        loc.z = l;
        this.setState({ location: loc });
    }

    renderInternal() {        
        let self = this;
        if (!this.state.map) return null;

        let map = self.state.map[self.state.location.map];
        if (map) {
            let level = map[self.state.location.z];
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
                var levelRender = <div class="map-level">{rows}</div>;
            }
            var levelMenu = <div class="map-level-menu">{map.map((lvl, lvlIdx) => {
                if (lvl) {
                    if (lvlIdx < self.state.you.z)
                        return <div class="map-level-button" key={"level_" + lvlIdx} onClick={() => self.setLevel(lvlIdx)}>Down {self.state.you.z - lvlIdx}</div>;
                    else if (lvlIdx > self.state.you.z)
                        return <div class="map-level-button" key={"level_" + lvlIdx} onClick={() => self.setLevel(lvlIdx)}>Up {lvlIdx - self.state.you.z}</div>;
                    return <div class="map-level-button" key={"level_" + lvlIdx} onClick={() => self.setLevel(lvlIdx)}>Current</div>;
                }
            })}</div>;
            
        }


        return <div class="map">{levelMenu}{ levelRender }</div>;
    }
}