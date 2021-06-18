//获取应用实例
const app = getApp()

Page({
  data: {
    pageStatus:'',
    optionsListData:[],
    movableViewPosition:{
        x:0,
        y:0,
        className:"none",
        data:{
          icon_type:1,
          is_complete:true
        }
    },
    scrollPosition:{
        everyOptionCell:136,
        top:0,
        scrollTop:0,
        scrollY:true,
        scrollViewHeight:1334,
        scrollViewWidth:375,
        windowViewHeight:1334,
    },
    selectItemInfo:{
        title:"",
        address:"",
        desc:"",
        selectIndex: -1,
        selectPosition:0,
    },
    flag:0,
    show_assistant:true,
    animation_flag:'',
    page:0,
    has_next:true,
    isShow: false,
    move_type:'',
    user:{
        headimgurl:'https://avatars2.githubusercontent.com/u/24517605?s=460&v=4',
        expected_birth_week:'拖拽排序+左滑删除'
    },
    navigationBarTitle:''
  },
  longpressfuc:function(e){
    var movableViewPosition={
        x:0,
        y:0,
        className:"none",
        data:{
          icon_type:1,
          is_complete:true
        }
    };
    this.setData({
      movableViewPosition:movableViewPosition
    })
    this.scrollTouchStart(e);

  },
  bindscroll:function (event) {
        var scrollTop = event.detail.scrollTop;
        this.setData({
            'scrollPosition.scrollTop':scrollTop
        })
        if(scrollTop >= 61){
          if(this.data.navigationBarTitle != '拖拽排序+左滑删除'){
            wx.setNavigationBarTitle({
              title: '拖拽排序+左滑删除'
            })
            this.setData({
              navigationBarTitle:'拖拽排序+左滑删除'
            })
          }
          
        }else{
          if(this.data.navigationBarTitle != ''){
            wx.setNavigationBarTitle({
              title: ''
            })
            this.setData({
              navigationBarTitle:''
            })
          }
        }
    },
    getOptionInfo:function (id) {
        for(var i=0,j=this.data.optionsListData.length;i<j;i++){
            var optionData= this.data.optionsListData[i];
            if(optionData.id == id){
                optionData.selectIndex = i;
                return optionData;
            }
        }
        return {};
    },
    getPositionDomByXY:function (potions) {
        var y = potions.y-this.data.scrollPosition.top+this.data.scrollPosition.scrollTop-81;
        var optionsListData = this.data.optionsListData;
        var everyOptionCell = this.data.scrollPosition.everyOptionCell;
        for(var i=0,j=optionsListData.length;i<j;i++){
            if(y>=i*everyOptionCell&&y<(i+1)*everyOptionCell){
                return optionsListData[i];
            }
        }
        return optionsListData[0];
    },
    draggleTouch:function (event) {
        var touchType = event.type;
        switch(touchType){
            case "touchstart":
                this.scrollTouchStart(event);
                break;
            case "touchmove":
                this.scrollTouchMove(event);
                break;
            case "touchend":
                this.scrollTouchEnd(event);
                break;
        }
    },
    scrollTouchStart:function (event) {
        var that=this;
        // console.log('开始');
        var firstTouchPosition = {
            x:event.changedTouches[0].pageX,
            y:event.changedTouches[0].pageY,
        }
        // console.log("firstTouchPosition:",firstTouchPosition);
        var domData = that.getPositionDomByXY(firstTouchPosition);
        domData.show_delet = false;

        // 排序时禁止已完成card移动------start--------
        if(that.data.move_type != 'reset_status' && domData.is_complete){
          that.setData({
            movableViewPosition:{
                x:0,
                y:0,
                className:"none",
                data:{
                  icon_type:1,
                  is_complete:true
                }
            }
          })
          return false;
        }
        // 排序时禁止已完成card移动------end--------

        // console.log("domData:",domData);

        //movable-area滑块位置处理
        var movableX = 0;
        var movableY = firstTouchPosition.y-that.data.scrollPosition.top-that.data.scrollPosition.everyOptionCell/2;

        that.setData({
            movableViewPosition:{
                x:movableX,
                y:movableY,
                className:"none",
                data:domData
            }
        })

        setTimeout(function(){
          that.setData({
              movableViewPosition:{
                  x:movableX,
                  y:movableY,
                  className:"",
                  data:domData
              }
          })
        },10)
        var id = domData.id;
        var secInfo = that.getOptionInfo(id);
        secInfo.selectPosition =  event.changedTouches[0].clientY;
        secInfo.selectClass = "dragSelected";

        that.data.optionsListData[secInfo.selectIndex].selectClass = "dragSelected";

        var optionsListData = that.data.optionsListData;

        that.setData({
            'scrollPosition.scrollY':false,
            selectItemInfo:secInfo,
            optionsListData:optionsListData,
            'scrollPosition.selectIndex':secInfo.selectIndex
        })
    },
    scrollTouchMove:function (event) {//频繁setdata导致性能问题，页面拖动卡顿
        // console.log('移动');
        var that=this;
        var selectItemInfo = that.data.selectItemInfo;
        var selectPosition = selectItemInfo.selectPosition;
        var moveDistance   = event.changedTouches[0].clientY+81;
        var everyOptionCell = that.data.scrollPosition.everyOptionCell;
        var optionsListData = that.data.optionsListData;
        var selectIndex = selectItemInfo.selectIndex;

        // console.log("event.changedTouches:",event.changedTouches);
        //movable-area滑块位置处理
        var movableX = 0;
        var movableY = event.changedTouches[0].pageY-that.data.scrollPosition.top-that.data.scrollPosition.everyOptionCell/2;


        that.setData({
            movableViewPosition:{
                x:movableX,
                y:movableY,
                className:"",
                data:that.data.movableViewPosition.data
            }
        })

        if(moveDistance - selectPosition > 0 && selectIndex < optionsListData.length - 1){
            if (optionsListData[selectIndex].id == selectItemInfo.id) {
                optionsListData.splice(selectIndex, 1);
                optionsListData.splice(++selectIndex, 0, selectItemInfo);
                selectPosition += everyOptionCell;
            }
        }

        if (moveDistance - selectPosition < 0 && selectIndex > 0) {
            if (optionsListData[selectIndex].id == selectItemInfo.id) {
                optionsListData.splice(selectIndex, 1);
                optionsListData.splice(--selectIndex, 0, selectItemInfo);
                selectPosition -= everyOptionCell;
            }
        }

        that.setData({
            'selectItemInfo.selectPosition': selectPosition,
            'selectItemInfo.selectIndex': selectIndex,
            optionsListData: optionsListData,
        });

    },
    scrollTouchEnd:function (event) {
        // console.log('结束');
        var that=this;
        var optionsListData = that.optionsDataTranlate(that.data.optionsListData,"");

        that.setData({
            optionsListData:optionsListData,
            'scrollPosition.scrollY':true,
            'movableViewPosition.className':"none",
            'movableViewPosition.is_complete':true
        })
        var movableViewPosition={
            x:0,
            y:0,
            className:"none",
            data:{
              icon_type:1,
              is_complete:true
            }
        };
        if(that.data.move_type != 'reset_status'){
          // console.log('排序');
            that.setData({
              movableViewPosition:movableViewPosition
            })
            var selectItemInfo = that.data.selectItemInfo;
            for(let i=0;i<optionsListData.length;i++){
              if(selectItemInfo.id == optionsListData[i].id){
                  if(optionsListData[i].sortNum == i){//原有顺序=当前顺序，未改变位置
                    return false;
                  }
                  var relation_id='';
                  if(i == 0){//移动后处于首位，上移
                    relation_id=optionsListData[i+1].id;
                    that.updateList(selectItemInfo.id,'reset_weight',relation_id);
                    return false;
                  }
                  if(i == (optionsListData.length - 1) ){//移动后处于末尾位，下移
                    relation_id=optionsListData[i-1].id;
                    that.updateList(selectItemInfo.id,'reset_weight',relation_id);
                    return false;
                  }

                  var pre_num=optionsListData[i-1].sortNum;//上一条数据初始顺序
                  var curr_num=optionsListData[i].sortNum;//移动数据初始顺序
                  if(pre_num > curr_num){ //下移
                    relation_id=optionsListData[i-1].id;
                    that.updateList(selectItemInfo.id,'reset_weight',relation_id);
                  }else{//上移
                    relation_id=optionsListData[i+1].id;
                    that.updateList(selectItemInfo.id,'reset_weight',relation_id);
                  }
              }
            }
            
        }else{
          that.setData({
            movableViewPosition:movableViewPosition
          })
        }
        // console.log(that.data);
    },
    optionsDataTranlate:function (optionsList,selectClass) {
        for(var i=0,j=optionsList.length;i<j;i++){
            optionsList[i].selectClass = selectClass;
        }
        return optionsList;
    },
    onLoad: function (options) {
        var systemInfo= wx.getSystemInfoSync();
        // 开始加载页面
        var scrollViewHeight = systemInfo.windowHeight;
        var scrollViewWidth = systemInfo.windowWidth;
        this.setData({
            'scrollPosition.scrollViewWidth':scrollViewWidth,
            'scrollPosition.scrollViewHeight':scrollViewHeight,
            'scrollPosition.windowViewHeight':systemInfo.windowHeight,
        });
        this.setData({
          img_path:''
        })
        //{{img_path}}
    },
    getData:function(){
        var that=this;
        var optionsList = [
            {"id":1,"title":"拖拽测试-1","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":1,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false},
            {"id":2,"title":"拖拽测试-2","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":2,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false},
            {"id":3,"title":"拖拽测试-3","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":3,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false},
            {"id":4,"title":"拖拽测试-4","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":4,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false},
            {"id":5,"title":"拖拽测试-5","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":5,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false},
            {"id":6,"title":"拖拽测试-6","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":4,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false},
            {"id":7,"title":"拖拽测试-7","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":1,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false},
            {"id":8,"title":"拖拽测试-8","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":2,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false},
            {"id":9,"title":"拖拽测试-9","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":1,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false},
            {"id":10,"title":"拖拽测试-10","desc":"长按左侧图标拖拽排序，左滑删除","address":"北京市朝阳区北京市朝阳区","icon_type":3,"is_complete":false,"show_delet":false,"selectClass":"","url":"","is_extend":false}
            ];
        that.setData({
          pageStatus:'ok',
          optionsListData:optionsList,
          has_next:false,
          move_type:''
        })
    },
    pageInit:function(){
        // 优先使用全局变量中位置信息，没有则重新请求位置信息
        var that =this;
    },
    scrolltolower:function(){
      var that =this;
      if(that.data.has_next ){
        if(that.data.has_next){
          that.getData();
        }
      }
    },
    handletouchmove: function(event) {
      // console.log(event)
      var that=this;
      if (that.data.flag!== 0){
        return
      }
      let currentX = event.touches[0].pageX;
      let currentY = event.touches[0].pageY;
      let tx = currentX - that.data.lastX;
      let ty = currentY - that.data.lastY;
      // let text = "";
      //左右方向滑动
      if (Math.abs(tx) > Math.abs(ty)) {
        that.setData({
          ['scrollPosition.scrollY']: false
        })
        if (tx < -80 && (ty <= 50 && ty >= -50)) {
          // text = "向左滑动";
          that.data.flag= 1;
          if(that.data.swiper_index != undefined){
            let index = that.data.swiper_index;
            let optionsListData = that.data.optionsListData;
            for(let i=0;i<optionsListData.length;i++){
              optionsListData[i].show_delet=false;
            }
            optionsListData[index].show_delet=true;
            that.setData({
                optionsListData
            });
          }
        }
        else if (tx > 80 && (ty <= 50 && ty >= -50)) {
          // text = "向右滑动";
          that.data.flag= 0;
          if(that.data.swiper_index != undefined){
            let index = that.data.swiper_index;
            that.setData({
                ['optionsListData['+ index +'].show_delet']: false
            });
          }
        }
      }
      
      that.setData({
        ['scrollPosition.scrollY']: true
      })
      //将当前坐标进行保存以进行下一次计算
      // this.data.lastX = currentX;
      // this.data.lastY = currentY;
      // console.log(text);
    },
   
    handletouchstart:function(event) {
      // console.log(event)
      var that=this;
      that.data.lastX = event.touches[0].pageX;
      that.data.lastY = event.touches[0].pageY;
      if(event.currentTarget.dataset.index != undefined){
        that.setData({
          swiper_index: event.currentTarget.dataset.index
        })
      }
    },
    fadeoutBox:function(e){
      var that=this,
          index=e.currentTarget.dataset.index;
      that.setData({
        ['optionsListData['+ index +'].show_delet']: false
      });
    },
    handletouchend:function(event) {
      var that=this;
      that.data.flag= 0 ;
      // console.log('结束滑动');
      that.setData({
        ['scrollPosition.scrollY']: true
      })
    },
    toggleAssistant:function(){
      var that=this;
      that.setData({
        show_assistant:!that.data.show_assistant
      })
    },
    completedown:function(e){
      var that=this;
      var flag=e.currentTarget.dataset.flag;
      var id=e.currentTarget.dataset.id;
      that.data.move_type = 'reset_status';
      if(that.data.animation_flag != ''){//阻止重复点击
        return false;
      }
      var optionsListData=that.data.optionsListData;
      var move_num=parseInt(optionsListData.length) - parseInt(flag) -1;
      var scroll_num=0;
      if(move_num >= 3){
        scroll_num=482;
      }else{
        scroll_num=e.changedTouches[0].clientY + 135*move_num;
      }
      
      that.setData({
        animation_flag:flag
      })
      that.scrollTouchStart(e);
      // console.log(e);
      // setTimeout(function(){
        var point_move=setInterval(function(){
          if(e.changedTouches[0].clientY <= scroll_num){
            e.changedTouches[0].clientY+=30;
            e.changedTouches[0].pageY+=30;
            that.scrollTouchMove(e);
          }else{
            clearInterval(point_move);
            that.setData({
              animation_flag:''
            })
            that.scrollTouchEnd(e);

            var n=parseInt(optionsListData.length -1);
            var relation_id = optionsListData[n].id;
            that.updateList(id,'reset_status',relation_id);
            // console.log('end');
            return false;
          }
        },10)
      // },100)
      
      
    },
    completeup:function(e){
      var that=this;
      var flag=e.currentTarget.dataset.flag;
      var id=e.currentTarget.dataset.id;
      that.data.move_type = 'reset_status';
      if(that.data.animation_flag != ''){//阻止重复点击
        return false;
      }
      var optionsListData=that.data.optionsListData;
      var move_num=parseInt(flag);
      var scroll_num=0;
      if(move_num >= 3){
        scroll_num=0;
      }else{
        scroll_num=e.changedTouches[0].clientY - 135*move_num;
      }
      
      that.setData({
        animation_flag:flag
      })
      that.scrollTouchStart(e);
      // console.log(e);
      // setTimeout(function(){
        var point_move=setInterval(function(){
          if(e.changedTouches[0].clientY >= scroll_num){
            e.changedTouches[0].clientY-=30;
            e.changedTouches[0].pageY-=30;
            that.scrollTouchMove(e);
          }else{
            clearInterval(point_move);
            that.setData({
              animation_flag:''
            })
            that.scrollTouchEnd(e);

            var relation_id = optionsListData[0].id;
            that.updateList(id,'reset_status',relation_id);
            // console.log('end');
            return false;
          }
        },10)
      // },100)
    },
    updateList:function(id,operate,relation_id){
      // wx.showLoading({
      //   mask:true
      // });
      var that=this;
      var ajaxData={};
      
    },
    deletItem:function(e){
      var that=this;
      var id=e.currentTarget.dataset.id;
      that.data.deletItem_id = id;
      that.showdialog();
    },
    confirmEvent:function(){
      var that=this;
      that.hidedialog();
      that.updateList(that.data.deletItem_id,'disable');
    },
    preventD:function(){

    },
    showdialog:function(){
      var that=this;
      that.setData({
        isShow: true
      })
    },
    hidedialog:function(){
      var that=this;
      that.setData({
        isShow: false
      })
    },
    goUrl:function(e){
      var that=this;
      var url=e.currentTarget.dataset.url;
      var id=e.currentTarget.dataset.id;
      var index=e.currentTarget.dataset.index;
      var optionsListData=that.data.optionsListData;
      var status=parseInt(e.currentTarget.dataset.status);
      
      if(status == 0){//已完成card，不支持跳转
        return false;
      }else{
        if(url && url != null){
          if(optionsListData[index].is_extend && !optionsListData[index].readed){
            wx.request({
              url: api.domain + '/v1/user_todo/'+id+'/readed/',
              method: 'GET',
              header: {
                Authorization: 'Bearer ' + app.globalData.jwt_token
              },
              success: res => {
                // console.log(res);
                wx.navigateTo({ url: url+'&id='+id});
              }
            })
          }else{
            wx.navigateTo({ url: url+'&id='+id});
          }
          
        }
      }
    },
    htouchmove:function(e){
        // console.log(e);
    },
    onShow: function () {
        // 页面显示
        // console.log("onShow");
        var that=this;
        // if(app.globalData.refresh_list){
        //   app.globalData.refresh_list = false;
        //   that.setData({
        //     page:0
        //   })
        //   that.getData();
        // }
        // app.globalData.refresh_list = false;
        that.setData({
          page:0
        })
        that.getData();
        that.pageInit();
        // app.globalData.setBookbuild = 1;
    },
    toggleDelet:function(e){
      var that=this,
          optionsListData=that.data.optionsListData,
          index=parseInt(e.currentTarget.dataset.index);
      if(optionsListData[index].show_delet){
        optionsListData[index].show_delet=false;
      }else{
        for(let i=0;i<optionsListData.length;i++){
          optionsListData[i].show_delet=false;
        }
        optionsListData[index].show_delet=true;
      }
      that.setData({
        optionsListData:optionsListData
      })
    },
    goMap:function(e){
      var that=this,
          optionsListData=that.data.optionsListData,
          index=e.currentTarget.dataset.index;
      if(optionsListData[index].latitude && optionsListData[index].latitude != null){
        wx.openLocation({
          latitude: optionsListData[index].latitude,
          longitude: optionsListData[index].longitude,
          scale: 14,
          name: optionsListData[index].name,
          address: optionsListData[index].address
        })
      }
    },
    onReady: function () {
        // 页面渲染完成
        // console.log("onReady");
    },
    onHide: function () {

        // 页面隐藏
        // console.log("onHide");
    },
    onUnload: function () {
        // 页面关闭
        // console.log("onUnload");
    },
  
  
})
