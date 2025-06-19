package ee.tlu.evkk.api.service;

import ee.tlu.evkk.dal.dao.ExerciseDao;
import ee.tlu.evkk.dal.dto.Exercise;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseService {

  private final ExerciseDao exerciseDao;

  public List<Exercise> getAllExercises() {
    return exerciseDao.findAllExercises();
  }

  public List<Exercise> searchExercises(String query) {
    return exerciseDao.searchByTitle(query);
  }

  public Exercise getExerciseById(Long id) {
    return exerciseDao.findById(id);
  }

  public void saveExercise(Exercise exercise) {
    if (existsByExternalId(exercise.getExternalId())) {
      throw new RuntimeException("ERROR_EXERCISE_ALREADY_EXISTS");
    }

    exercise.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
    exercise.setFilePath("uploads/exercises/" + exercise.getExternalId() + "/" + exercise.getExternalId() + ".h5p");
    exercise.setViews(0);
    exercise.setLikes(0);
    insertExercise(exercise);
  }

  public void insertExercise(Exercise exercise) {
    exerciseDao.insertExercise(exercise);
    exerciseDao.insertExerciseCategories(exercise);
    exerciseDao.insertExerciseTargetGroups(exercise);
  }

  public boolean existsByExternalId(String externalId) {
    return exerciseDao.findByExternalId(externalId) != null;
  }
}
