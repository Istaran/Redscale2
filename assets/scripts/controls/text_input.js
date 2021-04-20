GameDisplayer.registerControl('textBox', (colIndex, rowIndex, control) => {
    return <TextInputer key={colIndex * 10 + rowIndex} id={control.id} default={control.default} name={control.name} />;
});

class TextInputer extends React.Component {
    constructor(props) {
        super(props);

        GameDisplayer.formData[this.props.name] = this.props.default;
    }

    purgeCharacters(event) {
        event.target.value = event.target.value.replace(/[^a-zA-Z0-9 ]/, '');

        GameDisplayer.formData[this.props.name] = event.target.value || this.props.default;
    }

    render() {
        return <input type="text" placeholder={this.props.default} onInput={(event) => this.purgeCharacters(event)} />;
    }
}