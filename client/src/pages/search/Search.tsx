import React from 'react'
import './Search.scss'
import CompactVideo from "../../components/compact-video/CompactVideo"
import VideoApi from "../../api/videoApi"
import Spinner from "../../components/spinner/Spinner"
import {Video} from "../../../../server/src/common/entity/types"

type IProps = {}
type IState = {
    isLoaded: boolean,
    query: string,
    results: Video[],
}

class Search extends React.Component<IProps, IState> {
    videoApi = new VideoApi();

    constructor(props: IProps) {
        super(props)
        this.state = {
            isLoaded: false,
            query: '',
            results: [],
        }
    }

    static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
        if ((new URLSearchParams(window.location.search)).get('query') !== prevState.query) {
            return {
                query: (new URLSearchParams(window.location.search)).get('query'),
            }
        }

        return null
    }

    componentDidMount() {
        this.updateData()
    }

    componentDidUpdate(prevProps: IProps, prevState: IState) {
        if (prevState.query !== this.state.query) {
            this.setState({
                isLoaded: false,
            })
            this.updateData()
        }
    }

    updateData = () => {
        let query = (new URLSearchParams(window.location.search)).get('query') as string

        this.setState({
            isLoaded: false,
            results: [],
        })
        this.videoApi.search(query).then(r => {
            if (r.status !== 'OK') {
                return
            }
            this.setState({
                results: r.results,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };

    render() {
        return (
            <div className="search-result">
                {!this.state.isLoaded && <Spinner/>}
                {this.state.results.length !== 0 ? this.state.results.map(v => <CompactVideo
                    key={v.id} {...v}/>) : "По вашему запросу ничего не найдено"}
                {}
            </div>
        )
    }
}

export default Search