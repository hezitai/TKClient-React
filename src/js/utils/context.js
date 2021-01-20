import React from 'react';
export const AppContext = React.createContext('app');

class AppProvider extends Component {
  constructor(props) {
      super(props);
  }
  
  render() {
      return (
          <AppContext.Provider
              value={{
                  state: this.state,
              }}
          >
              {this.props.children}
          </AppContext.Provider>
      );
  }
}

export function withAppContext(Component) {
    return function WrapperComponent(props) {
        return (
            <AppContext.Consumer>
                {state => <Component {...props} context={state} />}
            </AppContext.Consumer>
        );
    };
}