import React from "react"
import CompactVideo from "../../components/compact-video/CompactVideo"
import Model from "../../api/videoApi"
import Spinner from "../../components/spinner/Spinner"
import {Video} from "../../../../server/src/common/entity/types"
import './Home.scss'

type stateTypes = {
    isLoaded: boolean
    pop: Video[]
    rat: Video[]
    res: Video[]
}

class Home extends React.Component<any, stateTypes> {
    private model = new Model();

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            pop: [],
            rat: [],
            res: [],
        }
    }

    componentDidMount() {
        let listPromise = []
        listPromise.push(this.model.getRating().then(r => {
            if (r.status !== 'OK') {
                return
            }
            this.setState({
                pop: r.results,
            })
        }))
        listPromise.push(this.model.getLiking().then(r => {
            if (r.status !== 'OK') {
                return
            }
            this.setState({
                rat: r.results,
            })
        }))
        listPromise.push(this.model.getRecently().then(r => {
            if (r.status !== 'OK') {
                return
            }
            this.setState({
                res: r.results,
            })
        }))
        Promise.all(listPromise).then(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    render() {
        return (
            <div className="home-page">
                {!this.state.isLoaded && <Spinner/>}
                <HomeBlock title="По количеству просмотров" vs={this.state.pop}/>
                <HomeBlock title="По количеству лайков" vs={this.state.rat}/>
                <HomeBlock title="Недавно загруженые" vs={this.state.res}/>
            </div>
        )
    }
}

const HomeBlock = ({title, vs}: { title: string, vs: Video[] }) => {
    return (
        <div className="home-block">
            <h3 className="home-block__title">{title}</h3>
            <div className="home-block-inner">
                {vs.length > 0 ? vs.map(v => {
                    return <CompactVideo key={v.id} {...v}/>
                }) : 'Не загружено еще не одно видео в базу'}
            </div>
        </div>
    )
}

export default Home