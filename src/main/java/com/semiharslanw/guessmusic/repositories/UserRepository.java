package com.semiharslanw.guessmusic.repositories;

import com.semiharslanw.guessmusic.models.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, ObjectId>{
    User findUserByUsername(String username);
}
