//
//  PlayerController.swift
//  MusicRoom
//
//  Created by jdavin on 11/3/18.
//  Copyright © 2018 Etienne Tranchier. All rights reserved.
//

import UIKit

class PlayerController: UIViewController, DZRPlayerDelegate {
    let tracks: [Track]
    var index: Int
    var hasPaused = false
    var isChangingMusic = false
    var isPlaying = true
    
    var networkType : DZRPlayerNetworkType?
    var request : DZRRequestManager?
    var cancelable : DZRCancelable?
    var deezer = DeezerManager()
    var track : DZRTrack?
    
    var progressCircle: ProgressCircle?
    var coverContainerView: CoverContainerView?
    var backgroundCoverView: BackgroundCoverView?
    
    init(_ tracks: [Track], _ index: Int) {
        self.tracks = tracks
        self.index = index
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    let visualEffectView: UIVisualEffectView = {
        let visualEffectView = UIVisualEffectView(effect: UIBlurEffect(style: .dark))
        visualEffectView.isUserInteractionEnabled = false
        visualEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        visualEffectView.translatesAutoresizingMaskIntoConstraints = false
        return visualEffectView
    }()

    let titleLabel: UILabel = {
        let label = UILabel()
        
        label.font = UIFont.systemFont(ofSize: 14, weight: .heavy)
        label.textColor = .white
        label.textAlignment = .center
        label.numberOfLines = 1
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    let authorLabel: UILabel = {
        let label = UILabel()
        
        label.font = UIFont.systemFont(ofSize: 14, weight: .heavy)
        label.textColor = .lightGray
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    let playButton: UIButton = {
        let button = UIButton(type: .system)
        let playIcon = UIImage(named: "play_icon")
        let tintedIcon = playIcon?.withRenderingMode(.alwaysTemplate)
        button.setImage(tintedIcon, for: .normal)
        button.tintColor = UIColor(white: 1, alpha: 1)
        button.translatesAutoresizingMaskIntoConstraints = false
        
        return button
    }()
    
    let nextButton: UIButton = {
        let button = UIButton(type: .system)
        let playIcon = UIImage(named: "nextTrack_icon")
        let tintedIcon = playIcon?.withRenderingMode(.alwaysTemplate)
        button.setImage(tintedIcon, for: .normal)
        button.tintColor = UIColor(white: 1, alpha: 1)
        button.translatesAutoresizingMaskIntoConstraints = false
        
        return button
    }()
    
    let previousButton: UIButton = {
        let button = UIButton(type: .system)
        let playIcon = UIImage(named: "previousTrack_icon")
        let tintedIcon = playIcon?.withRenderingMode(.alwaysTemplate)
        button.setImage(tintedIcon, for: .normal)
        button.tintColor = UIColor(white: 1, alpha: 1)
        button.translatesAutoresizingMaskIntoConstraints = false
        
        return button
    }()
    
    private lazy var player: DZRPlayer? = {
        guard let deezerConnect = DeezerManager.sharedInstance.deezerConnect,
            var _player = DZRPlayer(connection: deezerConnect) else { return nil }
        _player.shouldUpdateNowPlayingInfo = true
        _player.delegate = self
        return _player
    }()
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(true)
        
        player?.stop()
        AppUtility.lockOrientation(.all)
        guard let navi = navigationController as? CustomNavigationController, let tabBar = tabBarController as? TabBarController else { return }
        navi.addVisualEffect()
        tabBar.animatedShowTabBar()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        guard let navi = navigationController as? CustomNavigationController, let tabBar = tabBarController as? TabBarController else { return }
        navi.removeVisualEffect()
        tabBar.animatedHideTabBar()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupUI()
        setupPlayer()
        cancelable?.cancel()
        player?.stop()
        self.cancelable = DZRTrack.object(withIdentifier: String(tracks[index].id), requestManager: request, callback: { (response, err) in
            if let err = err {
                print("Player error: \(err.localizedDescription)")
                return
            }
            guard let res = response as? DZRTrack else { return }
            DispatchQueue.main.async {
                self.track = res
                self.setupButtons()
                self.setupProgressCircle()
                self.handlePlay()
            }
        })
    }
    
    func setupPlayer() {
        player?.networkType = .wifiAnd3G
        player?.shouldUpdateNowPlayingInfo = true
        request = DZRRequestManager.default().sub()
    }
    
    func player(_ player: DZRPlayer!, didPlay playedBytes: Int64, outOf totalBytes: Int64) {
        let progress = CGFloat(playedBytes) / CGFloat(totalBytes)
        progressCircle!.updateProgress(progress)
        if player.progress > 0.96 {
            handleNext()
        }
    }
    
    func setPlayIcon() {
        let playIcon = UIImage(named: "play_icon")
        
        let tintedIcon = playIcon?.withRenderingMode(.alwaysTemplate)
        playButton.setImage(tintedIcon, for: .normal)
    }
    
    func setPauseIcon() {
        let playIcon = UIImage(named: "pause_icon")
        let tintedIcon = playIcon?.withRenderingMode(.alwaysTemplate)
        playButton.setImage(tintedIcon, for: .normal)
    }
    
    @objc func handlePlay() {
        
        isPlaying = true
        hasPaused == false ? self.player?.play(track) : self.player?.play()
        setPauseIcon()
        playButton.removeTarget(self, action: #selector(handlePlay), for: .touchUpInside)
        playButton.addTarget(self, action: #selector(handlePause), for: .touchUpInside)
    }
    
    @objc func handlePause () {
        self.player?.pause()
        isPlaying = false
        hasPaused = true
        setPlayIcon()
        playButton.removeTarget(self, action: #selector(handlePause), for: .touchUpInside)
        playButton.addTarget(self, action: #selector(handlePlay), for: .touchUpInside)
    }
    
    @objc func handleNext() {
        if index + 1 < tracks.count, isChangingMusic == false {
            isChangingMusic = true
            backgroundCoverView?.handleNextAnimation()
            coverContainerView?.handleNextAnimation()
        }
    }
    
    @objc func handlePrevious() {
        if index - 1 >= 0, isChangingMusic == false {
            isChangingMusic = true
            backgroundCoverView?.handlePreviousAnimation()
            coverContainerView?.handlePreviousAnimation()
        }
    }
    
    fileprivate func loadTrackInplayer() {
        player?.stop()
        cancelable?.cancel()
        self.cancelable = DZRTrack.object(withIdentifier: String(tracks[index].id), requestManager: request, callback: { (response, err) in
            if let err = err {
                print("Player error: \(err.localizedDescription)")
                return
            }
            DispatchQueue.main.async {
                guard let res = response as? DZRTrack else { return }
                self.track = res
                self.progressCircle?.updateProgress(0)
                self.player?.play(res)
                self.hasPaused = true
                if self.isPlaying == true {
                    self.handlePlay()
                }
            }
        })
    }
    
    func setupTrack(indexOffset: Int) {
        index += indexOffset
        loadTrackInplayer()
        
        backgroundCoverView?.removeFromSuperview()
        visualEffectView.removeFromSuperview()
        coverContainerView?.removeFromSuperview()
        titleLabel.removeFromSuperview()
        authorLabel.removeFromSuperview()
        previousButton.removeFromSuperview()
        playButton.removeFromSuperview()
        nextButton.removeFromSuperview()
        progressCircle?.removeFromSuperview()
        
        setupUI()
        setupProgressCircle()
        
        isChangingMusic = false
        hasPaused = false
    }
    
    
    
    fileprivate func setupCoverContainer() -> CoverContainerView {
        var previousTrack: Track? = nil
        var nextTrack: Track? = nil
        if index - 1 >= 0 {
            previousTrack = tracks[index - 1]
        }
        let currentTrack = tracks[index]
        if index + 1 < tracks.count {
            nextTrack = tracks[index + 1]
        }
        return CoverContainerView(target: self, previousTrack, currentTrack, nextTrack)
    }
    
    fileprivate func setupBackgroudView() -> BackgroundCoverView {
        var previousTrack: Track? = nil
        var nextTrack: Track? = nil
        if index - 1 >= 0 {
            previousTrack = tracks[index - 1]
        }
        let currentTrack = tracks[index]
        if index + 1 < tracks.count {
            nextTrack = tracks[index + 1]
        }
        return BackgroundCoverView(previousTrack, currentTrack, nextTrack)
    }
    
    fileprivate func setupUI() {
        previousButton.addTarget(self, action: #selector(handlePrevious), for: .touchUpInside)
        playButton.addTarget(self, action: #selector(handlePlay), for: .touchUpInside)
        nextButton.addTarget(self, action: #selector(handleNext), for: .touchUpInside)
        
        let middleLineView: UIView = {
            let v = UIView()
            v.translatesAutoresizingMaskIntoConstraints = false
            return v
        }()
        
        navigationController?.navigationBar.topItem?.title = ""
        navigationController?.navigationBar.tintColor = .white
        
        backgroundCoverView = setupBackgroudView()
        coverContainerView = setupCoverContainer()
        
        coverContainerView?.translatesAutoresizingMaskIntoConstraints = false
        backgroundCoverView?.translatesAutoresizingMaskIntoConstraints = false
        
        coverContainerView?.clipsToBounds = true
        backgroundCoverView?.clipsToBounds = true
        
        titleLabel.text = tracks[index].title
        authorLabel.text = tracks[index].artist!.name
        
        view.addSubview(backgroundCoverView!)
        view.addSubview(visualEffectView)
        view.addSubview(middleLineView)
        view.addSubview(coverContainerView!)
        view.addSubview(titleLabel)
        view.addSubview(authorLabel)
        view.addSubview(previousButton)
        view.addSubview(playButton)
        view.addSubview(nextButton)
        
        NSLayoutConstraint.activate([
            backgroundCoverView!.topAnchor.constraint(equalTo: view.topAnchor),
            backgroundCoverView!.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            backgroundCoverView!.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            backgroundCoverView!.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            
            visualEffectView.topAnchor.constraint(equalTo: view.topAnchor),
            visualEffectView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            visualEffectView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            visualEffectView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            
            coverContainerView!.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: -40),
            coverContainerView!.bottomAnchor.constraint(equalTo: titleLabel.topAnchor, constant: -5),
            coverContainerView!.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            coverContainerView!.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            
            titleLabel.centerXAnchor.constraint(equalTo: view!.centerXAnchor),
            titleLabel.bottomAnchor.constraint(equalTo: authorLabel.topAnchor, constant: -5),
            titleLabel.heightAnchor.constraint(equalToConstant: 20),
            titleLabel.trailingAnchor.constraint(equalTo: coverContainerView!.trailingAnchor),
            titleLabel.leadingAnchor.constraint(equalTo: coverContainerView!.leadingAnchor),
            
            authorLabel.centerXAnchor.constraint(equalTo: titleLabel.centerXAnchor),
            authorLabel.bottomAnchor.constraint(equalTo: playButton.topAnchor, constant: -20),
            authorLabel.heightAnchor.constraint(equalToConstant: 20),
            authorLabel.trailingAnchor.constraint(equalTo: titleLabel.trailingAnchor),
            authorLabel.leadingAnchor.constraint(equalTo: titleLabel.leadingAnchor),
            
            previousButton.centerXAnchor.constraint(equalTo: view.centerXAnchor, constant: -80),
            previousButton.centerYAnchor.constraint(equalTo: playButton.centerYAnchor),
            previousButton.widthAnchor.constraint(equalToConstant: 30),
            previousButton.heightAnchor.constraint(equalToConstant: 30),
            
            playButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            playButton.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -100),
            playButton.widthAnchor.constraint(equalToConstant: 80),
            playButton.heightAnchor.constraint(equalToConstant: 80),
            
            nextButton.centerXAnchor.constraint(equalTo: view.centerXAnchor, constant: 80),
            nextButton.centerYAnchor.constraint(equalTo: playButton.centerYAnchor),
            nextButton.widthAnchor.constraint(equalToConstant: 30),
            nextButton.heightAnchor.constraint(equalToConstant: 30)
        ])
    }
    
    fileprivate func setupButtons() {
        
        
        
        NSLayoutConstraint.activate([
            
        ])
    }
    
    fileprivate func setupProgressCircle() {
        progressCircle = ProgressCircle(frame: CGRect(x: 0, y: 0, width: 76, height: 76))
        view.addSubview(progressCircle!)
        progressCircle!.translatesAutoresizingMaskIntoConstraints = false
        progressCircle!.isUserInteractionEnabled = false
        progressCircle!.layer.zPosition = playButton.layer.zPosition
        NSLayoutConstraint.activate([
            progressCircle!.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            progressCircle!.centerYAnchor.constraint(equalTo: playButton.centerYAnchor),
            progressCircle!.widthAnchor.constraint(equalToConstant: 76),
            progressCircle!.heightAnchor.constraint(equalToConstant: 76)
        ])
    }
}
