module.exports = {
    host:process.env.HOST || '127.0.0.1',
    port:process.env.PORT || '5200',
    apiHost:process.env.APIHOST || '127.0.0.1',
    apiPort:process.env.APIPORT || '5210',
    dbHost:"127.0.0.1",
    dbPort:"27017",
    app:{
        title:"personal blog",
        description:'Nealyang\'s personal blog demo',
        head:{
            titleTemplate:'blog',
            meta:[
                {
                    name:"description",
                    content:"react express demo"
                },
                {charset:"utf-8"}
            ]
        }
    }
};