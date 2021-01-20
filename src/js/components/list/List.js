/**
 * Created by weijin on 2018/6/19.
 */
'use strict';
import React  from 'react';
import PropTypes  from 'prop-types';
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer'
import { List as VList } from 'react-virtualized/dist/commonjs/List'
import { CellMeasurerCache, CellMeasurer } from 'react-virtualized/dist/commonjs/CellMeasurer'

class List extends React.Component{
    constructor(props){
        super(props);
    };
    componentDidMount(){
        if (this.props.initVList && typeof this.props.initVList === "function") {
            this.props.initVList(this.measureCache,this.VList);
        }
    };
    measureCache = new CellMeasurerCache({
        fixedWidth: true,
        // minHeight: 80
    });
    _renderItem = ({ index, key, parent, style }) => {
        let {rowCount, loadListItem} = this.props;
        if( !rowCount){
            return undefined ;
        }
        return (
            <CellMeasurer cache={this.measureCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
                {loadListItem(index, style , key)}
            </CellMeasurer>
        )
    };

    render(){
        let {overscanRowCount=10, rowCount, className, id, onScroll} = this.props;
        return(
            <AutoSizer>
                {({ width, height }) => (
                    <VList
                        ref={ref => this.VList = ref}
                        width={width}
                        height={height}
                        overscanRowCount={overscanRowCount}
                        rowCount={rowCount}
                        rowRenderer={this._renderItem.bind(this)}
                        className={className}
                        id={id}
                        deferredMeasurementCache={this.measureCache}
                        rowHeight={this.measureCache.rowHeight}
                        onScroll={(onScroll && typeof onScroll === "function")?onScroll:undefined}
                    />
                )}
            </AutoSizer>
        );
    };
}
List.propTypes = {
    rowCount:PropTypes.number,
    listItemArray:PropTypes.array,
    loadListItem:PropTypes.func,
    initVList:PropTypes.func,
};

export  default  List ;