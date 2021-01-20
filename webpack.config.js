/*项目必须的第三方配置组件66*/
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
//const PreloadWebpackPlugin = require('preload-webpack-plugin');
//const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
//const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');
// const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
//const ImageminPlugin = require('imagemin-webpack-plugin').default;/*图片压缩*/
const OpenBrowserPlugin = require('open-browser-webpack-plugin'); //自动打开浏览器
const ip = require('ip'); //获取本机ip

const appVersions = '3.2.0.4';  //系统版本号
const appVersionsTime = 2018121406;  //系统版本号更新时间
const adpVersions = '3.0.2';  //adapter版本号
const sdkVersions = '3.0.2';  //sdk版本号
const sdkVersionsTime = 2018121406;  //sdk版本号更新时间
const publishDirName = 'h5_new' ; // 发布的目录名字
const publishDirRelativePath = '../' ; //发布的相对地址
const publishDirPath = publishDirRelativePath+publishDirName ; //发布的目录路径(生成的文件目录相对地址)
const isThirdparty = false ; // 代码是否提供给第三方使用
const thirdpartyName = '' ; //GoGoTalk
// const forceUpdateTime = 2018011014 ;
const forceUpdateTime = new Date().getTime() ;
const forceUseSdkDebug = false ; //是否强制使用sdk的debug版本
const currentTarget = process.env.npm_lifecycle_event; // Detect how npm is run and branch based on that（当前 npm 运行）

//根据npm运行环境决定配置的变量
let debug,          // is debug
    devServer,      // is hrm mode
    minimize , 		// is minimize
    sourceMap ,       // is sourceMap
    sdkname ,       // sdk name
    jqname ,       // jq name
    utilsname ,       // utils name
    tanchuangname ,   //tanchuang name
    lcname ,       // lc name
    adpname ;       // sdk name
if (currentTarget === "build" || currentTarget === "build-watch") { // build mode （线上模式）
    process.env.NODE_ENV = 'production';
    debug = false, devServer = false, minimize = true , sourceMap = false , sdkname=  'tksdk' , adpname = 'adp.min' , jqname = 'jquery.min' , utilsname = 'tkCustomUtils.min' , lcname = 'tkwhiteboardsdk.min' , tanchuangname = 'popUpWindows.min';
} else if (currentTarget === "dev" || currentTarget === "dev-watch" ) { // dev mode （开发模式）
    debug = true, devServer = false, minimize = false , sourceMap = true  , sdkname=  'tksdk', adpname = !isThirdparty ?'adp':'adp.min'  , jqname =  !isThirdparty ?'jquery':'jquery.min' , utilsname =  !isThirdparty ?'tkCustomUtils':'tkCustomUtils.min' , lcname =  !isThirdparty ?'tkwhiteboardsdk':'tkwhiteboardsdk.min' , tanchuangname =  !isThirdparty ?'popUpWindows':'popUpWindows.min';
    process.env.NODE_ENV = 'development';
} else if (currentTarget === "dev-hrm") { // dev HRM mode （热更新模式）
    debug = true, devServer = true, minimize = false , sourceMap = true  ,sdkname= !isThirdparty ?  (forceUseSdkDebug?'tksdkdebug':'tksdk') : 'tksdk', adpname = !isThirdparty ?'adp':'adp.min' , jqname = !isThirdparty ?'jquery':'jquery.min'  , utilsname =  !isThirdparty ?'tkCustomUtils':'tkCustomUtils.min' , lcname =  !isThirdparty ?'tkwhiteboardsdk':'tkwhiteboardsdk.min', tanchuangname =  !isThirdparty ?'popUpWindows':'popUpWindows.min';
    process.env.NODE_ENV = 'development';
} else if(currentTarget === "build-hrm" ){// build HRM mode （热更新模式）
    debug = false, devServer = true, minimize = false , sourceMap = false  , sdkname='tksdk' , adpname = 'adp.min'  , jqname = 'jquery.min'  , utilsname = 'tkCustomUtils.min' , lcname = 'tkwhiteboardsdk.min', tanchuangname = 'popUpWindows.min';
    process.env.NODE_ENV = 'production';
}else{
    debug = false, devServer = false, minimize = true , sourceMap = false  , sdkname='tksdk' , adpname = 'adp.min' , jqname = 'jquery.min'  , utilsname = 'tkCustomUtils.min'  , lcname = 'tkwhiteboardsdk.min', tanchuangname = 'popUpWindows.min';
    process.env.NODE_ENV = 'production';
}

let PATHS = {
    publicPath: devServer ? '/publish/' : './', //发布目录
    srcPath: path.resolve(process.cwd(), './src'), //src 目录
    node_modulesPath: path.resolve('./node_modules'), //node_modules 目录
};

let entryConfig = { //入口地址配置
    tkMain:[
        path.join(PATHS.srcPath, 'tkMain.js') ,
    ] ,
    common: [
        "react","react-dom","react-router" /*,"babel-polyfill"*/ , "prop-types" ,
         'react-dnd' , 'react-dnd-html5-backend' , 'rc-slider', 'react-draggable'
    ],
};

let outputConfig = { //输出地址配置
    path: path.join(__dirname, publishDirPath), //输出目录
    publicPath: PATHS.publicPath, //发布后，资源的引用目录
    // filename: devServer ? 'js/[name].js' : 'js/[name]-[chunkhash:8].js', //输出的文件名称
    filename: devServer ? 'js/[name].js' : 'js/[name].js', //输出的文件名称
    chunkFilename: devServer ? 'js/[name].js' : 'js/[name]-[chunkhash:8].js' , //按需加载模块时输出的文件名称
};

let rulesConfig = [
    {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/, //屏蔽不需要处理的文件（文件夹）（可选）
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['env' , 'stage-0' , 'react'],
               /* presets: ['es2015' , 'react' , 'stage-0'],*/
                plugins: ['transform-runtime']
            }
        },
        include: PATHS.srcPath
    },
    {
        test: /\.css$/,
        //exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
            publicPath: '../' ,
            fallback: 'style-loader',
            use: [
                {
                    loader: 'css-loader',
                    options: {
                        minimize: !debug
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap:  !debug,
                        config: {
                            path: 'postcss.config.js'  // 这个得在项目根目录创建此文件
                        }
                    }
                },
            ]
        })
    },
    {
        test: /\.(png|gif|jpg|svg|jpeg|ico)$/,
        use: debug ? [
           'url-loader?limit=1&name=img/[name]-[hash:8].[ext]' ,
            // 'url-loader?limit=1&name=img/[name]-'+forceUpdateImgTime+'.[ext]' ,
        ]:[
            'url-loader?limit=1&name=img/[name]-[hash:8].[ext]' ,
            // 'url-loader?limit=1&name=img/[name]-'+forceUpdateImgTime+'.[ext]' ,
            'image-webpack-loader'
        ],
        //include: PATHS.srcPath
    },{
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader:'url-loader?name=fonts/[name].[md5:hash:hex:7].[ext]'
    }
    /*{
     test: /\.(eot?.+|svg?.+|ttf?.+|otf?.+|woff?.+|woff2?.+)$/,
     use: 'file-loader?name=assets/[name]-[hash].[ext]'
     },*/
];

let resolveConfig = {
    // modules: [path.resolve(__dirname, "src"), "node_modules"] ,
    extensions: ['.js', '.jsx', '.css' ],
    alias: {//模块别名定义，方便后续直接引用别名，无须多写长长的地址（别名，引用时直接可以通过别名引用）
        'ServiceTools': (PATHS.srcPath+'/js/services/ServiceTools'),//ServiceTools 服务
        'ServiceRoom': (PATHS.srcPath+'/js/services/ServiceRoom'),//ServiceRoom 服务
        'ServiceTooltip': (PATHS.srcPath+'/js/services/ServiceTooltip'),//ServiceTooltip 服务
        'ServiceSignalling': (PATHS.srcPath+'/js/services/ServiceSignalling'),//ServiceSignalling 服务
        'CoreController': (PATHS.srcPath+'/js/controller/CoreController'),//ServiceTools 服务
        'TkUtils': (PATHS.srcPath+'/js/utils/TkUtils'),//TkUtils 工具
        'eventObjectDefine': (PATHS.srcPath+'/js/utils/event/eventObjectDefine'),//eventObjectDefine 事件对象容器
        'TkConstant': (PATHS.srcPath+'/js/tk_class/TkConstant'),//TkConstant TK常量类
        'TkGlobal': (PATHS.srcPath+'/js/tk_class/TkGlobal'),//TkConstant TK全局变量类
        'RoleHandler': (PATHS.srcPath+'/js/tk_class/RoleHandler'),//RoleHandler  角色相关处理类
        'RoomHandler': (PATHS.srcPath+'/js/tk_class/RoomHandler'),//RoomHandler  房间相关处理类
        'ClassBroFunctions': (PATHS.srcPath+'/js/tk_class/ClassBroFunctions'),
        'StreamHandler': (PATHS.srcPath+'/js/tk_class/StreamHandler'),//StreamHandler  Stream流的相关处理类
        'TkAppPermissions': (PATHS.srcPath+'/js/tk_class/TkAppPermissions'),//TkAppPermissions  系统权限的相关处理类
        'WebAjaxInterface': (PATHS.srcPath+'/js/dao/WebAjaxInterface'),//WebAjaxInterface  web接口请求封装类
        'SignallingInterface': (PATHS.srcPath+'/js/dao/SignallingInterface'),//SignallingInterface  信令发送接口封装类
        'AsyncComponent': (PATHS.srcPath+'/js/components/router/AsyncComponent'),//AsyncComponent  提供 组件的异步加载
        'ButtonDumb': (PATHS.srcPath+'/js/components/base/button/Button'),//ButtonDumb  Button Dumb组件
        'UploadFileFrom': (PATHS.srcPath+'/js/containers/from/UploadFileFrom'),//UploadFileFrom  上传的Smart组件
        'TkSliderDumb': (PATHS.srcPath+'/js/components/slider/TkSlider'),//TkSliderDumb  Slider Dumb组件\
        'SelectDumb':(PATHS.srcPath+'/js/components/base/select/Select'),//Select  Dumb组件
        'reactDrag': (PATHS.srcPath+'/js/utils/reactDrag/reactDrag'),//拖拽组件
        'newDrag': (PATHS.srcPath+'/js/utils/newDrag/index.js'),
        '@': (PATHS.srcPath+'/js/containers/call/containers'),
        "src": PATHS.srcPath,
    }
};

let pluginsConfig = [
    new webpack.DefinePlugin({ //DefinePlugin 允许创建一个在编译时可以配置的全局常量
        __DEV__: debug,
        __SDKDEV__:debug ,
        __VERSIONS__:"'"+appVersions+"'" ,
        __VERSIONSTIME__:appVersionsTime,
        'process.env': {
            NODE_ENV: debug?'"development"':'"production"',
        },
    }),
    new webpack.optimize.ModuleConcatenationPlugin(), //ModuleConcatenationPlugin-->Scope Hoisting，又译作“作用域提升”(运行 Webpack 时加上 --display-optimization-bailout 参数可以得知为什么你的项目无法使用 Scope Hoisting)
    new webpack.optimize.CommonsChunkPlugin({ //CommonsChunkPlugin 插件，是一个可选的用于建立一个独立文件(又称作 chunk)的功能，这个文件包括多个入口 chunk 的公共模块
        names:["common", "webpackAssets" ] ,
        /*chunks: ['commonJs', 'plugsJs'],
         minChunks (module) {
         return module.context && module.context.indexOf('node_modules') >= 0;
         }*/
    }),
    new webpack.HashedModuleIdsPlugin(), //该插件会根据模块的相对路径生成一个四位数的hash作为模块id, 建议用于生产环境。
    new HtmlWebpackPlugin({ //HtmlWebpackPlugin简化了HTML文件的创建，以便为您的webpack包提供服务。
        title:thirdpartyName || 'TalkCloud',
        filename: 'index.html',
        template: __dirname + '/src/index.ejs',
        //path: PATHS.publicPath,
        inject: true, //是否放在底部
        favicon:false ,
        chunks: [],
        //chunks: ["common", 'tkMain' , 'webpackAssets'],
        excludeChunks: [''],
        chunksSortMode: 'dependency' , //根据依赖自动排序
        minify: debug?false:{
            collapseWhitespace: true, //删除空白符与换行符
            collapseInlineTagWhitespace: true,
            removeComments: true,  //移除HTML中的注释
            removeRedundantAttributes: true
        },
        /*======index.ejs需要的变量start=======*/
        sdkVersions:sdkVersions,
        appVersions:appVersions ,
        adpVersions:adpVersions ,
        appVersionsTime:appVersionsTime ,
        sdkVersionsTime:sdkVersionsTime ,
        sdkName:sdkname ,
        adpName:adpname ,
        jqName:jqname ,
        utilsName:utilsname ,
        lcName:lcname ,
        popUpWindowsName:tanchuangname ,
        lcVersions:2018092123,
        utilsVersions:2018092123,
        popUpWindowsVersions:2018092123,
        forceUpdateTime:forceUpdateTime ,
        packTime:new Date().toLocaleString() ,
        publishDirFix:devServer?'../publish/':'./'   ,
        __SDKDEV__:debug ,
        /*======index.ejs需要的变量end=======*/
    }),
    /* new PreloadWebpackPlugin({ //用于自动连接异步（和其他类型）的JavaScript块使用<link rel='preload'>
     rel: 'preload',
     as: 'script',
     include: 'all',
     fileBlacklist: [/\.(css|map)$/, /（common?.+）/]
     }),
     new ScriptExtHtmlWebpackPlugin({
     defaultAttribute: 'async' , //'sync' | 'async' | 'defer' The default attribute to set - 'sync'
     }),*/
    new ExtractTextPlugin({ //提取css文件到单独的文件中
        // filename: 'css/[name]-[chunkhash].css',
        filename: 'css/[name].css',
        allChunks: true
    }),
    /* new StyleExtHtmlWebpackPlugin({
     minify: !debug
     }),*/
    /*new CompressionPlugin({ //提供带 Content-Encoding 编码的压缩版的资源
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
        threshold: 1024,
        minRatio: 0.8
    })*/
];

if (minimize) {
    pluginsConfig.push(
        /*
         * Uglify
         * （压缩）
         * */
        new webpack.optimize.UglifyJsPlugin({ //Uglify js压缩
            //ie8:true , //启用IE8支持
            //ecma:5 , //支持的ECMAScript的版本
            mangle: {
                except: ['$super', '$', 'exports', 'require', 'module', 'import']
            },
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true
            },
            output: {
                comments: false ,
            }
        })
    )

};

if(!devServer){

    /*
     * extract file
     * （提取文件到指定的文件中）
     from    定义要拷贝的源目录           from: __dirname + ‘/src/public’
     to      定义要拷贝到的目标目录     from: __dirname + ‘/dist’
     toType  file 或者 dir         可选，默认是文件
     force   强制覆盖先前的插件           可选 默认false
     context                         可选 默认base context可用specific context
     flatten 只拷贝文件不管文件夹      默认是false
     ignore  忽略拷贝指定的文件           可以用模糊匹配
     */
    pluginsConfig.push(
        // Make sure that the plugin is after any plugins that add images
        /*  new ImageminPlugin({
         disable: debug , // Disable during development
         pngquant: {
         quality: '95-100'
         }
         }),*/
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, './publish/'),
                to: path.resolve(__dirname, publishDirPath+'/'),
                force: true,
                toType: 'dir',
                // ignore: ['.*']
                ignore:( !isThirdparty && debug  )?['tkwhiteboardsdk.min.js' , 'tkwhiteboardsdk.min.css'  , 'adp.min.js' ,'tksdkdebug.js' , 'jquery.min.js' , 'tkCustomUtils.min.js' , 'popUpWindows.min.js', 'tk_adapter_tool.js']:['tkwhiteboardsdk.js'  , 'tkwhiteboardsdk.css'  , 'adp.js','tksdkdebug.js' , 'jquery.js' ,  'tkCustomUtils.js' , 'popUpWindows.js', 'tk_adapter_tool.js']
            }
        ])
    );
};

let exportsConfig = {
    entry: entryConfig,
    //resolveLoader: {root: path.join(__dirname, "node_modules")}, //查找loader 的位置
    output: outputConfig,
    module: {
        rules:rulesConfig
    },
    resolve: resolveConfig,
    plugins: pluginsConfig,
    //postcss:postcssConfig ,
};

if(sourceMap){ //开启生成source-map模式
    Object.assign(exportsConfig , {
        devtool:"source-map"
    });
};

if (devServer) { //开启热更新，并自动打开浏览器
    // let devServerIp = '192.168.1.182' ;
    let devServerIp = ip.address();
    let devServerPort = 8444;
    // let devServerPort = 8080;
    // let devServerProtocol = 'https' ;
    let devServerProtocol = 'https' ;
    let  devServerRouter = 'login' ;
    let devServerParams = 'host=global.talk-cloud.net%26domain%3Dwlm%26param%3DUlrPD9oltD_3PUJ4MGME8UWueLmeVG4s-1HkVcoKWIf4i4NNcZP2TbzosmW7Favj2yHW9C5n5pHzByWjiHB6mR7378qSDYa1sQZT4cWPwSdwGiQwkZHeOEm8hr_dqtNXpfZLX5Bm1DU%26timestamp%3D1526262160%26roomtype%3D0';
    Object.assign(exportsConfig ,{
        devServer:{
            // Enable history API fallback so HTML5 History API based
            // routing works. This is a good default that will come
            // in handy in more complicated setups.
            historyApiFallback: true,
            // Unlike the cli flag, this doesn't set
            // HotModuleReplacementPlugin!
            hot: true,
            inline: true,
            https: devServerProtocol === "https" ,
            // Display only errors to reduce the amount of output.
            stats: 'errors-only',
            // Parse host and port from env to allow customization.
            // If you use Vagrant or Cloud9, set
            // host: options.host || '0.0.0.0';
            // 0.0.0.0 is available to all network devices
            // unlike default `localhost`.
            host: devServerIp, // Defaults to `localhost`   process.env.HOST
            port: devServerPort,  // Defaults to 8080   process.env.PORT
        }
    });
    if(!exportsConfig.plugins){
        exportsConfig.plugins = [] ;
    }
    //配置自动打开浏览器
    if(webpack.HotModuleReplacementPlugin){ //启用热替换模块(Hot Module Replacement)，也被称为 HMR
        exportsConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin({
                multiStep: false
            })
        );
    }
    if(OpenBrowserPlugin){
        exportsConfig.plugins.push(
            new OpenBrowserPlugin({
                url:devServerProtocol+'://'+devServerIp+':'+devServerPort + PATHS.publicPath + 'index.html#/'+devServerRouter+'?'+devServerParams
            })
        );
    }
}

module.exports = exportsConfig ;
