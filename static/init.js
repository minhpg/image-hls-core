const initPlayer = (link) => {
    let player = jwplayer("player");
    let object = {
        key: "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99",
        playbackRateControls: true,
        controls: true,
        volume: 75,
        stretching: "uniform",
        width: "100%",
        height: "100%",
        file: link,
        type: "hls",
        preload: "auto",
    }
    player.setup(object);
    player.addButton("/dist/svg/skip-forward.svg", "Skip OP/ED", function () {
        skip_time = player.getPosition() + 90;
        player.seek(skip_time)
    }, "skipButton");
    player.addButton("/dist/svg/forward.svg", "Tua tiếp 5s", function () {
        player.seek(player.getPosition() + 5);
    }, "Tua tiếp 5s");
    player.addButton("/dist/svg/backward.svg", "Tua lại 5s", function () {
        player.seek(player.getPosition() - 5);
    }, "Tua lại 5s");
    if (Hls.isSupported() && p2pml.hlsjs.Engine.isSupported()) {
        var engine = new p2pml.hlsjs.Engine();
        jwplayer_hls_provider.attach();
        p2pml.hlsjs.initJwPlayer(player, {
            liveSyncDurationCount: 7, // To have at least 7 segments in queue
            loader: engine.createLoaderClass(),
        });
    }
    player.on('ready', () => {
        console.log(player)
    });
}

const getInfo = () => {
    return new Promise((resolve, reject) => {
        initPlayer(`/api/m3u8/${id}/master.m3u8`)
    })
}
getInfo().catch((err) => {
    console.error(err)
})