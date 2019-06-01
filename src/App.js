import React from 'react';
import MeScroll from 'mescroll.js'
import 'mescroll.js/mescroll.min.css'
import './App.css';
var mescrollArr = new Array(3);//4个菜单所对应的4个mescroll对象
class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      curNavIndex:0
    }
    this.tabBar = React.createRef();
  }
  tabTitle = (e) => {
    var i = Number(e.target.dataset.index);
    if(i === 0){
			this.tabBar.current.style.left = "8.325%";
		}else if(i === 1){
			this.tabBar.current.style.left = "41.625%";
		}else{
			this.tabBar.current.style.left = "74.925%";
		}
    if(this.state.curNavIndex!==i) {
      //更改列表条件
      document.querySelector(".nav .active").setAttribute("class","row-3");
      e.target.setAttribute("class","row-3 active");
      //隐藏当前列表和回到顶部按钮
      document.querySelector("#mescroll"+this.state.curNavIndex).style.display = "none";
      mescrollArr[this.state.curNavIndex].hideTopBtn();
      //显示对应的列表
      document.querySelector("#mescroll"+i).style.display = "block";;
      //取出菜单所对应的mescroll对象,如果未初始化则初始化
      if(mescrollArr[i]==null){
        mescrollArr[i]=this.initMescroll("mescroll"+i, "dataList"+i);
      }else{
        //检查是否需要显示回到到顶按钮
        var curMescroll=mescrollArr[i];
        var curScrollTop=curMescroll.getScrollTop();
        if(curScrollTop>=curMescroll.optUp.toTop.offset){
          curMescroll.showTopBtn();
        }else{
          curMescroll.hideTopBtn();
        }
      }
      //更新标记
      this.setState({
        curNavIndex:i
      });
    }
  }
  componentDidMount(){
    //初始化首页
    mescrollArr[0]=this.initMescroll("mescroll0", "dataList0");
  }
  /*联网加载列表数据  page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
  getListData = (page) => {
    // let _this = this;
    //联网加载数据
    var dataIndex = this.state.curNavIndex; //记录当前联网的nav下标,防止快速切换时,联网回来curNavIndex已经改变的情况;
    this.getListDataFromNet(dataIndex, page.num, page.size, (pageData) => {
      //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
      //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
      console.log("dataIndex="+dataIndex+", curNavIndex="+this.state.curNavIndex+", page.num="+page.num+", page.size="+page.size+", pageData.length="+pageData.length);
      
      //方法一(推荐): 后台接口有返回列表的总页数 totalPage
      //mescrollArr[dataIndex].endByPage(pageData.length, totalPage); //必传参数(当前页的数据个数, 总页数)
      
      //方法二(推荐): 后台接口有返回列表的总数据量 totalSize
      //mescrollArr[dataIndex].endBySize(pageData.length, totalSize); //必传参数(当前页的数据个数, 总数据量)
      
      //方法三(推荐): 您有其他方式知道是否有下一页 hasNext
      //mescrollArr[dataIndex].endSuccess(pageData.length, hasNext); //必传参数(当前页的数据个数, 是否有下一页true/false)
      
      //方法四 (不推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据,如果传了hasNext,则翻到第二页即可显示无更多数据.
      // mescrollArr[dataIndex].endSuccess(pageData.length);
      mescrollArr[dataIndex].endSuccess(pageData.length);
      //提示:pageData.length必传的原因:
      // 1.判断是否有下一页的首要依据: 当传的值小于page.size时,则一定会认为无更多数据.
      // 2.比传入的totalPage, totalSize, hasNext具有更高的判断优先级
      // 3.使配置的noMoreSize生效
      
      //设置列表数据
      this.setListData(pageData,dataIndex);
    },() => {
      //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
      mescrollArr[dataIndex].endErr();
    });
  }
  
  /*联网加载列表数据
    在您的实际项目中,请参考官方写法: http://www.mescroll.com/api.html#tagUpCallback
    请忽略getListDataFromNet的逻辑,这里仅仅是在本地模拟分页数据,本地演示用
    实际项目以您服务器接口返回的数据为准,无需本地处理分页.
    * */
  getListDataFromNet(curNavIndex,pageNum,pageSize,successCallback,errorCallback) {
    //延时一秒,模拟联网
    setTimeout(function () {
      fetch('https://www.sjooy.com/mescroll/json.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageNum,
          pageSize,
        })
      }).then(res => {
        return res.json()
      }).then(data => {
        console.log(data);
        var listData=[];
          //curNavIndex 全部0; 待支付1; 已完成2;
          if(curNavIndex===0){
            //全部 (模拟分页数据)
            for (var i = (pageNum-1)*pageSize; i < pageNum*pageSize; i++) {
              if(i===data.length) break;
              listData.push(data[i]);
            }
          }else if(curNavIndex===1){
            //待支付
            for (var j = 0; j < data.length; j++) {
              if (data[j].pdName.indexOf("奶粉")!==-1) {
                listData.push(data[j]);
              }
            }
          }else if(curNavIndex===2){
            //已完成
            for (var k = 0; k < data.length; k++) {
              if (data[k].pdName.indexOf("面膜")!==-1) {
                listData.push(data[k]);
              }
            }
          }
          //回调
          successCallback(listData);
      }).catch(err => {
        errorCallback()
      })
    },500)
  }

  /*创建MeScroll对象*/
  initMescroll = (mescrollId,clearEmptyId) => {
    let mescroll = new MeScroll(mescrollId, {
    	//上拉加载的配置项
    	up: {
    		callback: this.getListData, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
    		isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
    		noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
    		empty: {
    			icon: "http://www.mescroll.com/demo/res/img/mescroll-empty.png", //图标,默认null
    			tip: "暂无相关数据~", //提示
    			btntext: "去逛逛 >", //按钮,默认""
    			btnClick: function(){//点击按钮的回调,默认null
    				alert("点击了按钮,具体逻辑自行实现");
    			} 
    		},
    		clearEmptyId: clearEmptyId, //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
    		toTop:{ //配置回到顶部按钮
    			src : "http://www.mescroll.com/demo/res/img/mescroll-totop.png", //默认滚动到1000px显示,可配置offset修改
    			//offset : 1000
    		},
    		lazyLoad: {
          use: true // 是否开启懒加载,默认false
        }
    	}
    });
    return mescroll;
  }
  /*设置列表数据
    * pageData 当前页的数据
    * dataIndex 数据属于哪个nav */
  setListData(pageData,dataIndex){
    var listDom=document.getElementById("dataList"+dataIndex);
    for (var i = 0; i < pageData.length; i++) {
      var pd=pageData[i];
      
      var str='<img class="pd-img" src="../res/img/loading-sq.png" imgurl="'+pd.pdImg+'"/>';
      str+='<p class="pd-name">'+pd.pdName+'</p>';
      str+='<p class="pd-price">'+pd.pdPrice+' 元</p>';
      str+='<p class="pd-sold">已售'+pd.pdSold+'件</p>';
      
      var liDom = document.createElement("li");
      liDom.innerHTML = str;
      listDom.appendChild(liDom);
    }
  }
  render(){
    return (
      <div className="App">
        <div className="gift-tab-title">
          <ul onClick={this.tabTitle} className="nav">
            <li data-index="0" className="row-3 active">全部</li>
            <li data-index="1" className="row-3">奶粉</li>
            <li data-index="2" className="row-3">面膜</li>
          </ul>
          <span className="cur" ref={this.tabBar}></span>
        </div>

        <div id="mescroll0" className="mescroll">
          <ul id="dataList0" className="data-list"></ul>
        </div>

        <div id="mescroll1" className="mescroll hide">
          <ul id="dataList1" className="data-list"></ul>
        </div>

        <div id="mescroll2" className="mescroll hide">
          <ul id="dataList2" className="data-list"></ul>
        </div>

      </div>
    );
  }
}

export default App;
