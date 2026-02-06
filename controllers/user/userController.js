const loadHome = async(req,res)=>{
    try {
        return res.render('home')
        
    } catch (error) {
        console.log('home page not found',error.message)
        res.status(500).send('server Error')
    }
}
const pageNotFound = async(req,res)=>{
    try {
        return res.render('page-404')
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

module.exports = {
    loadHome,pageNotFound
}
