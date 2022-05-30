

module.exports = (req,res) => {
    res.render('embed',{id:req.params.id})
}