const Banner = require('../../models/user/bannerSchema');
const path = require('path');
const fs = require('fs');

const getBannerPage = async (req, res) => {
    try {
        const banners = await Banner.find({});
        res.render('banners', { banners });
    } catch (error) {
        res.redirect('/admin/pageerror');
    }
};

const getAddBannerPage = async (req, res) => {
    try {
        res.render('add-banner');
    } catch (error) {
        res.redirect('/admin/pageerror');
    }
};

const addBanner = async (req, res) => {
    try {
        const { title, description, link, startDate, endDate } = req.body;
        const image = req.file.filename;
        const newBanner = new Banner({
            image,
            title,
            description,
            link,
            startDate,
            endDate
        });
        await newBanner.save();
        res.redirect('/admin/banners');
    } catch (error) {
        res.redirect('/admin/pageerror');
    }
};

const deleteBanner = async (req, res) => {
    try {
        const id = req.query.id;
        await Banner.deleteOne({ _id: id });
        res.redirect('/admin/banners');
    } catch (error) {
        res.status(500).send({ success: false, message: "Failed to delete banner" });
    }
};

module.exports = {
    getBannerPage,
    getAddBannerPage,
    addBanner,
    deleteBanner
};
