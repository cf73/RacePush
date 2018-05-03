const React = require('react')
const range = require('range')
const ReactFlex = require('react-flex')
require('react-flex/index.css')
import Img from 'gatsby-image'
const FlipMove = require('react-flip-move');
import styled from 'styled-components';
import { navigateTo } from 'gatsby-link';
import Card from './card.js';
const queryString = require('query-string');

const Video = styled.video`
  width: 100%;
  display: block;
`

const defaultToEmpty = arr => (arr ? arr : [])

const shuffle = (arr) => {
  var currentIndex = arr.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }

  return arr;
}

const reorder = (arr, order) => {
  const newArr = new Array(arr.length);
  order.forEach((item, i) => {
    newArr[i] = arr[item];
  })
  return newArr;
}

export const getCards = (relationships, queryFilter) => [
  ...defaultToEmpty(relationships.articles).filter(article => !queryFilter || queryFilter == `article`).map((article, i) => (
    <Card key={`article-${i}`} title={article.title} type="Article" slug="article" changed={article.changed}>
      {article.field_short_version && (
        <div dangerouslySetInnerHTML={{ __html: article.field_short_version.processed }} />
      )}
    </Card>
  )),
  ...defaultToEmpty(relationships.clips).filter(clip => !queryFilter || queryFilter == `clip`).map((clip, i) => (
    <Card key={`clip-${i}`} type="Clip" title={clip.title} slug="clip" changed={clip.changed}>
      <h4>{clip.title}</h4>
      {clip.relationships.field_clip ? (
        <div>
          <Video controls>
            <source
              src={clip.relationships.field_clip.localFile.publicURL}
              type={
                clip.relationships.field_clip.localFile.internal.mediaType
              }
            />
          </Video>
        </div>
      ) : (
        <small>No video file attached</small>
      )}
    </Card>
  )),
  ...defaultToEmpty(relationships.faqs).filter(faq => !queryFilter || queryFilter == `faq`).map((faq, i) => (
    <Card key={`faq-${i}`} type="FAQ" title="faq.title" slug="faq" changed={faq.changed}>
      <h3>{faq.title}</h3>
    </Card>
  )),
  ...defaultToEmpty(relationships.quickfacts).filter(quickfact => !queryFilter || queryFilter == `quickfact`).map((quickfact, i) => (
    <Card key={`quickfact-${i}`} type="QuickFact" title="quickfact.title" slug="quickfact" changed={quickfact.changed}>
      <h4>{quickfact.title}</h4>
    </Card>
  )),
]

class SubthemeSection extends React.Component {
  constructor(props){
    console.log('calling')
    super(props)

    this.updateOrder(props)
  }
  shouldComponentUpdate(nextProps) {
    return nextProps.filter !== this.props.filter;
  }
  componentWillUpdate(nextProps) {
    this.updateOrder(nextProps)
  }
  updateOrder(props) {
    if (props.filter) return;
    const length = getCards(props.data.relationships, props.filter).length;
    this.order = shuffle(range.range(length))
  }
  render() {
    const subtheme = this.props.data
    const { Flex, Item } = ReactFlex

    // TODO (Conrad): Create custom card component for each type of data (article, clip, faq, etc)

    const { filter } = this.props;

    const allRelationships = filter ?
      getCards(subtheme.relationships, filter).sort((a, b) => (b.props.changed - a.props.changed)) :
      reorder(getCards(subtheme.relationships, filter), this.order)

    const description = subtheme.description
      ? [
          <div
            style={{ minWidth: 300, padding: 10 }}
            key="description"
            dangerouslySetInnerHTML={{ __html: subtheme.description.processed }}
          />,
        ]
      : []

    const allCards = [...description, ...allRelationships]

    return (
      <div className={this.props.className}>
        <h3>{subtheme.name}</h3>
        {
          [`faq`, `article`, `clip`].map(filterType => (
            <button
              onClick={() => {
                const newQueryParams = { ... this.props.queryParams }
                if (newQueryParams[this.props.name] == filterType){
                  delete newQueryParams[this.props.name]
                } else {
                  newQueryParams[this.props.name] = filterType;
                }
                navigateTo(`?${queryString.stringify(newQueryParams)}`)
              }}
              style={{
                background: this.props.filter == filterType ? `#666` : `white`,
                color: this.props.filter == filterType ? `white` : `#666`,
                marginRight: 20,
                marginBottom: 20
              }}
            >
              {filterType}
            </button>
          ))
        }
        <div style={{ display: 'flex', 'flex-wrap': 'wrap', overflowX: 'auto', justifyContent: 'space-around' }}>
          {allCards}
        </div>
      </div>
    )
  }
}


const SubthemeContainer = styled(SubthemeSection)`
  background-color: cornflowerblue;
  padding: 20px;
  margin: 50px;
`

export default SubthemeContainer;

