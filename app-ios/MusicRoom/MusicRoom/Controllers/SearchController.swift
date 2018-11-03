//
//  SearchController.swift
//  MusicRoom
//
//  Created by Jonathan DAVIN on 10/30/18.
//  Copyright © 2018 Etienne Tranchier. All rights reserved.
//

import UIKit

class SearchController: UICollectionViewController, UICollectionViewDelegateFlowLayout {

    private let categoryCellId = "categoryCellId"
    private let searchCellId = "searchCellId"
    
    let manager = APIManager()
    let initialSearch = "Daft Punk"
    
    var musicCategories: [MusicCategory]?
    
    override func viewDidLoad() {
        super.viewDidLoad()

        collectionView?.backgroundColor = UIColor(white: 0.2, alpha: 1)
        collectionView?.alwaysBounceVertical = true
        collectionView?.register(CategoryCell.self, forCellWithReuseIdentifier: categoryCellId)
        collectionView?.register(SearchCell.self, forCellWithReuseIdentifier: searchCellId)
        
        
        performSearch(initialSearch) { (albums, tracks, artists) in
            self.musicCategories = MusicCategory.sampleMusicCategories(albums, tracks, artists)
            self.collectionView?.reloadData()
        }
    }
    
    func handleStearch(_ text: String) {
        musicCategories?.removeAll()
        collectionView?.reloadData()
        performSearch(text) { (albums, tracks, artists) in
            self.musicCategories = MusicCategory.sampleMusicCategories(albums, tracks, artists)
            self.collectionView?.reloadData()
        }
    }
    
    func performSearch(_ text: String, completion: @escaping ([Album], [Track], [Artist]) -> ())
    {
        manager.search(text) { (tracks, albums, artists) in
            completion(albums, tracks, artists)
        }
    }
    
    override func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        if indexPath.item == 0 {
            let     cell = collectionView.dequeueReusableCell(withReuseIdentifier: searchCellId, for: indexPath) as! SearchCell
            return cell
        } else {
            let     cell = collectionView.dequeueReusableCell(withReuseIdentifier: categoryCellId, for: indexPath) as! CategoryCell
            cell.musicCategory = musicCategories![indexPath.item - 1]
            cell.backgroundColor = UIColor(white: 0.2, alpha: 1)
            return cell
        }
    }
    
    override func willTransition(to newCollection: UITraitCollection, with coordinator: UIViewControllerTransitionCoordinator) {
        collectionViewLayout.invalidateLayout()
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        
        switch indexPath.item {
        case 0:
            return CGSize(width: view.frame.width, height: 40)
        case 1:
            return CGSize(width: view.frame.width, height: 240)
        case 2:
            return CGSize(width: view.frame.width, height: 360)
        case 3:
            return CGSize(width: view.frame.width, height: 200)
        default:
            return CGSize(width: view.frame.width, height: 240)
        }
    }
    
    override func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if let m = musicCategories {
            return m.count + 1
        }
        return 1
    }
}
