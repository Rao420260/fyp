-- =====================================================
-- PostFlow: Social Media Scheduling System
-- Database: MySQL 8
-- =====================================================

-- DEVELOPMENT ONLY: ye line purana database mita deti hai taake script
-- dobara chal sake. Jab asli data aa jaye to is line ko hata dena.
DROP DATABASE IF EXISTS postflow;

-- utf8mb4 zaroori hai taake posts me emoji aur Urdu text save ho sake
CREATE DATABASE postflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE postflow;

-- -----------------------------------------------------
-- 1. users
-- -----------------------------------------------------
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','creator','manager') NOT NULL DEFAULT 'creator',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 2. social_accounts
-- -----------------------------------------------------
CREATE TABLE social_accounts (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,
  platform            ENUM('facebook','instagram','linkedin','x') NOT NULL,
  account_name        VARCHAR(150) NOT NULL,
  external_account_id VARCHAR(150) NULL,
  access_token        TEXT NULL,
  refresh_token       TEXT NULL,
  token_expires_at    DATETIME NULL,
  status              ENUM('connected','expired','disconnected')
                      NOT NULL DEFAULT 'connected',
  connected_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_accounts_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_platform_account (user_id, platform, external_account_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 3. posts
-- -----------------------------------------------------
CREATE TABLE posts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id    INT UNSIGNED NOT NULL,
  title        VARCHAR(150) NOT NULL,
  content      TEXT NOT NULL,
  status       ENUM('draft','pending','approved','rejected',
                    'scheduled','published','failed')
               NOT NULL DEFAULT 'draft',
  submitted_at DATETIME NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_posts_status (status),
  INDEX idx_posts_author (author_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 4. post_media
-- -----------------------------------------------------
CREATE TABLE post_media (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id    INT UNSIGNED NOT NULL,
  file_url   VARCHAR(255) NOT NULL,
  file_type  VARCHAR(50) NOT NULL,
  file_size  INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_post
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 5. post_targets
-- -----------------------------------------------------
CREATE TABLE post_targets (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id           INT UNSIGNED NOT NULL,
  social_account_id INT UNSIGNED NOT NULL,
  publish_status    ENUM('waiting','published','failed')
                    NOT NULL DEFAULT 'waiting',
  external_post_id  VARCHAR(150) NULL,
  published_at      DATETIME NULL,
  error_message     VARCHAR(500) NULL,
  CONSTRAINT fk_targets_post
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_targets_account
    FOREIGN KEY (social_account_id) REFERENCES social_accounts(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_post_account (post_id, social_account_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 6. approvals
-- -----------------------------------------------------
CREATE TABLE approvals (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id     INT UNSIGNED NOT NULL,
  reviewer_id INT UNSIGNED NOT NULL,
  decision    ENUM('approved','rejected') NOT NULL,
  comment     VARCHAR(500) NULL,
  decided_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_approvals_post
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_approvals_reviewer
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_approvals_post (post_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 7. schedules
-- -----------------------------------------------------
CREATE TABLE schedules (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id         INT UNSIGNED NOT NULL UNIQUE,
  scheduled_by    INT UNSIGNED NOT NULL,
  scheduled_at    DATETIME NOT NULL,
  status          ENUM('waiting','processing','done','failed')
                  NOT NULL DEFAULT 'waiting',
  retry_count     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_attempt_at DATETIME NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedules_post
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedules_user
    FOREIGN KEY (scheduled_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_schedules_due (status, scheduled_at)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 8. post_status_history
-- -----------------------------------------------------
CREATE TABLE post_status_history (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id     INT UNSIGNED NOT NULL,
  from_status VARCHAR(20) NULL,
  to_status   VARCHAR(20) NOT NULL,
  changed_by  INT UNSIGNED NULL,
  note        VARCHAR(255) NULL,
  changed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_post
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_history_post (post_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 9. notifications
-- -----------------------------------------------------
CREATE TABLE notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  post_id    INT UNSIGNED NULL,
  type       ENUM('submitted','approved','rejected','published','failed')
             NOT NULL,
  message    VARCHAR(255) NOT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_post
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 10. ai_history
-- -----------------------------------------------------
CREATE TABLE ai_history (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  prompt     TEXT NOT NULL,
  tone       VARCHAR(20) NULL,
  platform   VARCHAR(20) NULL,
  response   TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;