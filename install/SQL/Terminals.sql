CREATE TABLE `Terminals` (
  `ID`           SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Name`         VARCHAR(40)       NOT NULL,
  `Token`        VARCHAR(64)       NOT NULL UNIQUE,
  `Enabled`      BOOLEAN           NOT NULL DEFAULT TRUE,
  `Created` DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Changed`  DATETIME          NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE `Terminal.Token` (`Token`)
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8;