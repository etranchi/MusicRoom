//
//  AlbumController.swift
//  MusicRoom
//
//  Created by jdavin on 11/11/18.
//  Copyright © 2018 Etienne Tranchier. All rights reserved.
//

import UIKit

class AlbumController: UITableViewController {

    let album: Album
    var tracks: [Track]?
    let albumCover: UIImage
    
    var headerView: AlbumHeaderView!
    let songCellId = "SongCellId"
    
    private let headerHeight: CGFloat = 200
    
    init(_ album: Album, _ albumCover: UIImage) {
        self.album = album
        self.albumCover = albumCover
        super.init(nibName: nil, bundle: nil)
        self.tracks = AlbumTracksToTracksConverter()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        let navi = navigationController as? CustomNavigationController
        let offsetY = navi?.navigationBar.frame.size.height
        navi?.visualContainerView.transform = CGAffineTransform(translationX: 0, y: -offsetY! - 50)
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        let navi = navigationController as? CustomNavigationController
        navi?.animatedShowNavigationBar()
    }
    
    override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
        
        updateHeaderView()
        let navi = navigationController as? CustomNavigationController
        if tableView.contentOffset.y < -90 {
            navi?.animatedHideNavigationBar()
        } else {
            navi?.animatedShowNavigationBar()
        }
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        updateHeaderView()
        
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        guard album.tracks != nil else { return }
        tableView.separatorStyle = .none
        
        tableView.backgroundColor = UIColor(white: 0.1, alpha: 1)
        setupHeader()
    }
    
    func updateHeaderView() {
        
        var headerRect = CGRect(x: 0, y: -headerHeight, width: tableView.bounds.width, height: headerHeight)
        if tableView.contentOffset.y < -headerHeight {
            headerRect.origin.y = tableView.contentOffset.y
            headerRect.size.height = -tableView.contentOffset.y
            headerView.frame = headerRect
        }
    }
    
    fileprivate func setupHeader() {
        headerView = AlbumHeaderView(frame: .zero, albumCover: albumCover, title: "\(album.title) by \(String(describing: album.artist!.name))")
        headerView.translatesAutoresizingMaskIntoConstraints = true
        tableView.register(AlbumTrackListCell.self, forCellReuseIdentifier: songCellId)
        tableView.tableHeaderView = nil
        tableView.addSubview(headerView)
        tableView.contentInset = UIEdgeInsets(top: headerHeight, left: 0, bottom: 45, right: 0)
        tableView.contentOffset = CGPoint(x: 0, y: -headerHeight)
        updateHeaderView()
    }
    
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: songCellId, for: indexPath) as! AlbumTrackListCell
    
        cell.selectedBackgroundView = UIView()
        cell.backgroundColor = UIColor(white: 0.1, alpha: 1)
        cell.track = tracks?[indexPath.row]
        cell.authorLabel.text = album.artist?.name
        return cell
    }

    override func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if let tracks = tracks {
            return tracks.count
        }
        return 0
    }
    
    override func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 44.0
    }
}


extension AlbumController {
    func AlbumTracksToTracksConverter() -> [Track] {
        var tracks: [Track] = []
        
        album.tracks?.forEach({ (track) in
            let tr = Track.init(id: track.id, readable: track.readable, link: nil, album: nil, artist: nil, title: track.title, duration: track.duration)
            tracks.append(tr)
        })
        return tracks
    }
}
