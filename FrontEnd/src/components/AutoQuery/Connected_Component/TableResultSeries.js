import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';

import { connect } from 'react-redux'
import * as actions from '../../../actions/TableResult'


class TableResultSeries extends Component {

    async componentDidMount(){
        await this.fetchDataIfUnknown(this.props.rowData.studyInstanceUID, this.props.rowData.originAET)
    }

    async fetchDataIfUnknown(studyInstanceUID, originAET){
        
        var result = this.props.results.filter(study => {
            return study.studyInstanceUID === studyInstanceUID
        })

        if (result[0]['seriesDetails'].length === 0 ){
            await this.getSeriesDetails(studyInstanceUID, originAET)
        } 
    }


    async getSeriesDetails(studyUID, aet){

        let queryData = {
            Level: 'Series',
            Query: {
                Modality: '',
                ProtocolName: '',
                SeriesDescription: '',
                SeriesInstanceUID: '',
                StudyInstanceUID: studyUID,
                SeriesNumber: '',
                NumberOfSeriesRelatedInstances: ''
            },
            Normalize: false
        }

        let queryAnswers = await fetch("/api/modalities/"+aet+"/query",
        {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(queryData)
        }).then((answer)=>{
          return(answer.json())
        })

        let seriesAnswers = await this.getSeriesDetailsAnswer(queryAnswers.ID)

        this.props.addSeriesDetails(seriesAnswers, studyUID)

    }

    //SK : Cette fonction est dupliquée dans table query
    // Voir avec evolution de React Thunk
    async getSeriesDetailsAnswer(orthancIdQuery){

        let queryAnswers = await fetch("/api/queries/"+orthancIdQuery+"/parsedAnswers", {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            }).then((answer)=>{
            return(answer.json())
            }).catch(error => console.log(error))
        
        return queryAnswers

    }

    selectRow = {
        mode: 'checkbox',
        clickToSelect: true
    };

    columns = [{
        dataField: 'key',
        hidden: true,
        csvExport: false
    },{
        dataField: 'level',
        hidden: true,
        csvExport: false
    }, {
        dataField: 'answerId',
        hidden: true,
        csvExport: false
    }, {
        dataField: 'answerNumber',
        hidden: true,
        csvExport: false
    },{
        dataField: 'studyInstanceUID',
        hidden: true,
        csvExport: false
    }, {
        dataField: 'serieInstanceUID',
        hidden: true,
        csvExport: false
    }, {
        dataField: 'serieDescription',
        text: 'Serie Description',
        sort: true
    }, {
        dataField: 'modality',
        text: 'Modality',
        sort: true
    }, {
        dataField: 'serieNumber',
        text: 'Serie Number',
        sort: true
    }, {
        dataField: 'numberOfSeriesRelatedInstances',
        text: 'Instances'
    }];

    render() {

        let currentStudy = this.props.results.filter( (studyData)=>{
            if(studyData.studyInstanceUID === this.props.rowData.studyInstanceUID){
                return true
            }
            return false
        })

        let seriesDetails = currentStudy[0]['seriesDetails']

        return (
            <ToolkitProvider
                keyField="key"
                data={seriesDetails}
                columns={this.columns}
            >{
                    props => (
                        <React.Fragment>
                            <BootstrapTable ref={n => this.node = n} {...props.baseProps} striped={true} selectRow={this.selectRow} bordered={ false } />
                        </React.Fragment>
                    )
                }
            </ToolkitProvider>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        results: state.ResultList.results
    }
}

export default connect(mapStateToProps, actions)(TableResultSeries);