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
            self.setState({
                map: map, location: location, you: Object.assign({}, location) });

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

    setZone(z) {
        let self = this;
        let loc = self.state.location;
        loc.map = z;
        let map = self.state.map[z];
        if (map) {
            if (z == self.state.you.map)
                loc.z = self.state.you.z;
            else {
                let looped = false;
                while (!self.anyRooms(map[loc.z]))
                {
                    loc.z++;
                    if (loc.z > map.length) {
                        loc.z = 0;
                        if (looped) break;
                        looped = true;
                    }
                }
            }
        }
        self.setState({ location: loc });
    }

    anyRooms(lvl) {
        let any = false;
        if (lvl) {
            lvl.forEach((row) => {
                if (row) {
                    row.forEach((cell) => {
                        if (cell) any = true;
                    });
                }
            });
        }
        return any;
    }

    renderInternal() {        
        let self = this;
        if (!this.state.map) return null;

        let map = self.state.map[self.state.location.map];
        if (map) {
            let level = map[self.state.location.z];
            if (level) {
                let minX = 1000;
                let minY = 1000;
                level.forEach((r, y) => {
                    if (r) {
                        r.forEach((c, x) => {
                            if (c) {
                                minX = Math.min(minX, x);
                                minY = Math.min(minY, y);
                            }
                        });
                    }
                });

                let rows = level.map((row, rowIdx) => {
                    if (row) {
                        let rooms = row.map((room, roomIdx) => {
                            if (room) {
                                return <MapCell details={room} row={rowIdx - minY + 1} col={roomIdx - minX + 1} />;
                            }
                        });
                        return rooms;
                    }
                });
                var levelRender = <div class="map-level">{rows}</div>;
            }
            var levelMenu = <div class="map-level-menu">{map.map((lvl, lvlIdx) => {
                if (this.anyRooms(lvl)) {
                    if (self.state.you.map == self.state.location.map && lvlIdx == self.state.you.z)
                        return <div class="map-level-button highlighted" key={"level_" + lvlIdx} onClick={() => self.setLevel(lvlIdx)}>*</div>;
                    else if (lvlIdx == self.state.location.z)
                        return <div class="map-level-button gray" key={"level_" + lvlIdx}>*</div>;
                    return <div class="map-level-button" key={"level_" + lvlIdx} onClick={() => self.setLevel(lvlIdx)}>*</div>;
                }
            })}</div>;
            var zoneMenu = <div class="map-zone-menu">{Object.keys(this.state.map).map((zone, zoneIdx) => {
                if (self.state.map[zone]) {
                    if (self.state.you.map == zone)
                        return <div class="map-zone-button highlighted" key={"zone_" + zoneIdx} onClick={() => self.setZone(zone)}>{zone}</div>;
                    else if (self.state.location.map == zone)
                        return <div class="map-zone-button gray" key={"zone_" + zoneIdx} >{zone}</div>;
                    return <div class="map-zone-button" key={"zone_" + zoneIdx} onClick={() => self.setZone(zone)}>{zone}</div>;
                }
            })}</div>;
            
        }


        return <div class="map">{zoneMenu}{levelMenu}{ levelRender }</div>;
    }
}