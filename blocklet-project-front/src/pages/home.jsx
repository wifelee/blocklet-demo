import { useState } from 'react';
import logo from '../logo.svg';
import BTC from '../bitcoin.svg';
import axios from '../libs/api';
import moment from 'moment';
function Home() {
  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState('');
  const [hashObj, setHashObj] = useState({});
  const [list, setList] = useState([]);
  const [page, setPage] = useState(0);
  const [pageTotal, setPageTotal] = useState(0);
  /**
   * 请求rawblock函数
   * @param {*} hash block hash
   */
  const loadData = async (hash) => {
    try {
      setLoading(true);
      const res = await axios.get(`https://blockchain.info/rawblock/${hash}`);
      setLoading(false);
      if (res.status === 200) {
        setHashObj(res.data);
        const tx_list = res.data['tx'];
        let arr = [];
        for (let i = 0; i < tx_list.length; i += 10) {
          arr.push(tx_list.slice(i, i + 10));
        }
        setList(arr);
        setPageTotal(arr.length);
      }
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * input防抖
   * @param {*} func callback执行
   * @param {*} wait 延时器时间
   * @returns
   */
  const debounce = (func, wait) => {
    let timeOut = null;
    return function (args) {
      timeOut && clearTimeout(timeOut); //一定要清除定时器
      timeOut = setTimeout(() => {
        func(args);
      }, wait);
    };
  };
  /**
   * 整理out的值
   * @param {*} list out数组
   * @returns
   */
  const onCountOutput = (list = []) => {
    const total = list
      .flatMap((a) => a.value)
      .reduce((a, b) => {
        return a + b;
      });
    return parseFloat(total / 100000000).toFixed(8);
  };
  return (
    <div className="container">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <input
          placeholder="Search Blockchain"
          type="text"
          className="sc-ea823bf2-2 haolHO"
          onChange={debounce((e) => {
            setHash(e.target.value);
          }, 200)}
          onKeyUp={(e) => {
            if (e.keyCode === 13) {
              if (hash.trim()) {
                loadData(hash);
              }
            }
          }}></input>
      </header>
      {loading ? (
        <div className="no-data">Please wait for while we process your request...</div>
      ) : (
        <div className="list">
          {list.length > 0 ? (
            <div className="item-wrapper">
              <div className="detail-wrapper">
              <div style={{margin:'12px 0',display:'flex',justifyContent:'center',alignItem:'center'}}><img src={BTC} style={{marginRight:'12px'}} /> BTC</div>
                <div className="detail-cell">
                  <div>
                    <span>Hash </span>{' '}
                    <span> {`${hashObj.hash.slice(0, 4)}...${hashObj.hash.slice(hashObj.hash.length - 4, hashObj.hash.length)}`}</span>
                  </div>
                  <div>
                    <span>Size </span>{' '}
                    <span> {hashObj.size}</span>
                  </div>
                </div>
                <div className="detail-cell">
                  <div>
                    <span>Height </span>{' '}
                    <span> {hashObj.height}</span>
                  </div>
                  <div>
                    <span>Weight </span>{' '}
                    <span> {hashObj.weight}</span>
                  </div>
                </div>
              </div>
              {list[page].map((a, i) => {
                return (
                  <div className="item" key={a.hash}>
                    <div className="item-left">
                      <div className="hash">
                        <span style={{ color: 'rgb(0, 0, 0)' }}>TX {i}</span>
                        <span> • </span>
                        <span>Hash </span>
                        <span style={{ color: 'rgb(255, 161, 51)', position: 'relative' }} className={'hover-line'}>
                          {`${a.hash.slice(0, 4)}-${a.hash.slice(a.hash.length - 4, a.hash.length)}`}
                        </span>
                      </div>
                      <div className="date">{moment(parseInt(a.time * 1000)).format('YYYY-MM-DD HH:mm:ss')}</div>
                    </div>
                    <div className="item-right">
                      <div className="asset">
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgb(0, 0, 0)' }}>
                          {onCountOutput(a.out)} BTC{' '}
                        </span>
                        {/* <span>146,286</span> */}
                        <span></span>
                      </div>
                      <div className="fee">
                        <span style={{ color: 'rgb(244, 91, 105)' }}>Fee</span>
                        <span style={{ color: 'rgb(0,0,0)' }}>
                          {' '}
                          {a.fee ? `${(Number(a.fee) / 1000).toFixed(1)}k` : a.fee}{' '}
                        </span>
                        {/* <span style={{ color: 'rgb(0,0,0)' }}>Sats </span>
                      <span>$0.00</span> */}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="pagination">
                <div
                  className="page-click"
                  onClick={() => {
                    if (page > 0) {
                      setPage(page - 1);
                    }
                  }}>
                  上一页
                </div>
                <div style={{ margin: '0 12px' }}>
                  {page + 1}/{pageTotal}页
                </div>
                <div
                  className="page-click"
                  onClick={() => {
                    if (page < pageTotal - 1) {
                      setPage(page + 1);
                    }
                  }}>
                  下一页
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              Oops!
              <div className="tips-mini">Please enter an address, transaction hash, block height or hash</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
