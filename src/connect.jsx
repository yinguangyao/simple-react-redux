import React, { useEffect, useMemo, useContext, useState } from 'react';
import ReactReduxContext from './context';
const connect = (mapStateToProps, mapDispatchToProps) => {
    return (WrappedComponent) => {
        return (props) => {
            const { store, subscription } = useContext(ReactReduxContext);
            const [count, setCount] = useState(0)
            useEffect(() => {
                subscription.onStateChange = () => setCount(count + 1)
            }, [count])
            const newProps = useMemo(() => {
                const stateProps = mapStateToProps(store.getState()),
                    dispatchProps = mapDispatchToProps(store.dispatch);
                return {
                    ...stateProps,
                    ...dispatchProps,
                    ...props
                }
            }, [props, store, count])
            return <WrappedComponent {...newProps} />
        }
    }
}
export default connect;